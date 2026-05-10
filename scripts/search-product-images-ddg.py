#!/usr/bin/env python3
"""
Search product images via DuckDuckGo Images (scraping library) and emit a JSON updates file
compatible with scripts/bulk-update-product-images.ts:

  [{ "id": "grace_001", "imageUrls": ["https://...", ...] }, ...]

Best practice notes:
- Rate-limited, concurrency controlled.
- Resumable: reuses existing output file and won't re-search IDs already present (unless --overwrite).
- Writes a separate report file with failures.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Tuple
from urllib.parse import urlparse


def _need_dep(name: str, pip_name: Optional[str] = None) -> None:
    pip_name = pip_name or name
    print(
        f"[images] Missing python dependency '{name}'. Install with:\n"
        f"  python3 -m pip install {pip_name}\n",
        file=sys.stderr,
    )
    sys.exit(2)

def _get_ddgs():
    try:
        # New package name (recommended).
        from ddgs import DDGS  # type: ignore

        return DDGS
    except Exception:
        try:
            # Back-compat for older installs.
            from duckduckgo_search import DDGS  # type: ignore

            return DDGS
        except Exception:
            _need_dep("ddgs", "ddgs")


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def normalize_url(u: str) -> Optional[str]:
    u = (u or "").strip()
    if not u:
        return None
    if u.startswith("//"):
        u = "https:" + u
    if not re.match(r"^https?://", u, re.I):
        return None
    return u


STOPWORDS = {
    "and",
    "or",
    "the",
    "a",
    "an",
    "of",
    "for",
    "with",
    "to",
    "in",
    "on",
    "by",
    "at",
    "from",
    "set",
    "kit",
    "pack",
    "pcs",
    "pc",
    "new",
}

ELECTRONICS_KEYWORDS = {
    "led",
    "lighting",
    "light",
    "lamp",
    "bulb",
    "tube",
    "panel",
    "ceiling",
    "strip",
    "driver",
    "adapter",
    "power",
    "watt",
    "w",
    "solar",
    "battery",
    "inverter",
    "charge",
    "charger",
    "ac",
    "dc",
    "amp",
    "amps",
    "ampere",
    "a",
    "ah",
    "mah",
    "volt",
    "voltage",
    "v",
    "12v",
    "24v",
    "36v",
    "48v",
    "110v",
    "220v",
    "240v",
    "switch",
    "breaker",
    "fuse",
    "socket",
    "plug",
    "connector",
    "cable",
    "wire",
    "fan",
    "emergency",
    "flood",
    "spotlight",
    "downlight",
}

NON_ELECTRONICS_KEYWORDS = {
    "shirt",
    "tshirt",
    "dress",
    "shoe",
    "shoes",
    "bag",
    "watch",
    "ring",
    "necklace",
    "toy",
    "game",
    "food",
    "recipe",
    "cosmetic",
    "makeup",
    "skincare",
    "hair",
    "car",
    "motor",
    "porn",
}


DEFAULT_BLOCK_DOMAINS = {
    "pinterest.com",
    "pinimg.com",
    "facebook.com",
    "fbcdn.net",
    "tiktok.com",
    "instagram.com",
    "shopee",
    "aliexpress.com",
    "alicdn.com",
    "lazada",
    "tokopedia",
}


def derive_brand(product_id: str) -> str:
    product_id = (product_id or "").strip().lower()
    if "_" in product_id:
        return product_id.split("_", 1)[0]
    return ""


def pick_title(row: Dict[str, Any]) -> str:
    # Prefer English title, fall back to Khmer title, then name.
    for key in ("title", "name", "title_km", "titleKm"):
        v = row.get(key)
        if isinstance(v, str) and v.strip():
            return v.strip()
    return ""

def pick_category_hint(row: Dict[str, Any]) -> str:
    for key in ("category_label", "categoryLabel", "category", "raw_category"):
        v = row.get(key)
        if isinstance(v, str) and v.strip():
            return v.strip()
    return ""

def tokenize(text: str) -> List[str]:
    text = (text or "").lower()
    text = re.sub(r"[^a-z0-9]+", " ", text)
    out = [t for t in text.split() if t and t not in STOPWORDS and len(t) >= 2]
    # Dedup preserving order
    seen = set()
    uniq = []
    for t in out:
        if t in seen:
            continue
        seen.add(t)
        uniq.append(t)
    return uniq


def url_host(u: str) -> str:
    try:
        host = urlparse(u).hostname or ""
        return host.lower()
    except Exception:
        return ""


def host_matches(block_or_prefer: Iterable[str], host: str) -> bool:
    host = (host or "").lower()
    for d in block_or_prefer:
        d = (d or "").strip().lower()
        if not d:
            continue
        if host == d or host.endswith("." + d) or d in host:
            return True
    return False


def looks_like_logo(u: str, title: str) -> bool:
    hay = f"{u} {title}".lower()
    return bool(re.search(r"\\b(logo|icon|favicon|sprite|vector|svg|banner)\\b", hay))


@dataclass
class Update:
    id: str
    imageUrls: List[str]


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser()
    p.add_argument(
        "products_json",
        help="Path to a JSON array of products. Must include at least { id, title }.",
    )
    p.add_argument(
        "--out",
        default="artifacts/image-search/updates.json",
        help="Output updates JSON path.",
    )
    p.add_argument(
        "--report",
        default="artifacts/image-search/report.json",
        help="Report JSON path for failures.",
    )
    p.add_argument(
        "--images-per-product",
        type=int,
        default=5,
        help="Max image URLs to keep per product.",
    )
    p.add_argument(
        "--concurrency",
        type=int,
        default=4,
        help="Number of parallel searches.",
    )
    p.add_argument(
        "--delay-ms",
        type=int,
        default=250,
        help="Delay between requests per worker (best effort).",
    )
    p.add_argument(
        "--query-template",
        default="EcoBright {brand} {title} {category}",
        help='Search query template. Variables: "{brand}" "{title}" "{id}" "{category}".',
    )
    p.add_argument(
        "--prefer-domains",
        default="",
        help="Comma-separated domain substrings to prioritize (e.g. ecobright.com,my-supplier.com).",
    )
    p.add_argument(
        "--block-domains",
        default="",
        help="Comma-separated domain substrings to exclude. Merged with a sensible default blocklist.",
    )
    p.add_argument(
        "--min-score",
        type=float,
        default=6.0,
        help="Minimum score required to accept an image URL (reduces wrong matches).",
    )
    p.add_argument(
        "--candidate-multiplier",
        type=int,
        default=6,
        help="Fetch up to images_per_product * multiplier candidates and pick the best-scoring ones.",
    )
    p.add_argument(
        "--verify-content-type",
        action="store_true",
        help="For selected URLs, issue a lightweight request and keep only image/* responses.",
    )
    p.add_argument(
        "--require-electronics",
        action="store_true",
        help="Require results to look electronics/lighting-related (keyword-based).",
    )
    p.add_argument(
        "--only-missing",
        action="store_true",
        help="Skip products that already have image_urls/imageUrls/image_url fields present in products_json.",
    )
    p.add_argument(
        "--overwrite",
        action="store_true",
        help="Re-search and replace existing entries in --out.",
    )
    p.add_argument(
        "--limit",
        type=int,
        default=0,
        help="Limit number of products processed (0 = all).",
    )
    p.add_argument(
        "--checkpoint-every",
        type=int,
        default=25,
        help="Write partial --out/--report every N completed items (helps resume if interrupted).",
    )
    return p.parse_args()


def has_any_image(row: Dict[str, Any]) -> bool:
    # Support a few field names depending on export.
    for k in ("image_urls", "imageUrls"):
        v = row.get(k)
        if isinstance(v, list) and any(isinstance(x, str) and x.strip() for x in v):
            return True
    v = row.get("image_url") or row.get("imageUrl")
    if isinstance(v, str) and v.strip():
        return True
    return False


def load_existing_updates(path: Path) -> Dict[str, Update]:
    if not path.exists():
        return {}
    try:
        data = read_json(path)
        if not isinstance(data, list):
            return {}
        out: Dict[str, Update] = {}
        for row in data:
            if not isinstance(row, dict):
                continue
            pid = str(row.get("id") or "").strip()
            urls = row.get("imageUrls")
            if not pid or not isinstance(urls, list):
                continue
            norm = []
            seen = set()
            for u in urls:
                if not isinstance(u, str):
                    continue
                nu = normalize_url(u)
                if not nu or nu in seen:
                    continue
                seen.add(nu)
                norm.append(nu)
            if norm:
                out[pid] = Update(id=pid, imageUrls=norm)
        return out
    except Exception:
        return {}


def ddg_search_images(query: str, max_results: int) -> List[str]:
    urls: List[str] = []
    seen = set()
    DDGS = _get_ddgs()
    with DDGS() as ddgs:
        for r in ddgs.images(query, max_results=max_results):
            if not isinstance(r, dict):
                continue
            u = r.get("image")
            if not isinstance(u, str):
                continue
            nu = normalize_url(u)
            if not nu or nu in seen:
                continue
            seen.add(nu)
            urls.append(nu)
            if len(urls) >= max_results:
                break
    return urls


def ddg_search_candidates(query: str, max_results: int) -> List[Dict[str, Any]]:
    DDGS = _get_ddgs()
    out: List[Dict[str, Any]] = []
    with DDGS() as ddgs:
        for r in ddgs.images(query, max_results=max_results):
            if isinstance(r, dict):
                out.append(r)
            if len(out) >= max_results:
                break
    return out


def build_query(tpl: str, row: Dict[str, Any]) -> Tuple[str, str, str]:
    pid = str(row.get("id") or "").strip()
    title = pick_title(row)
    brand = derive_brand(pid)
    category = pick_category_hint(row)
    q = (
        tpl.replace("{id}", pid)
        .replace("{title}", title)
        .replace("{brand}", brand)
        .replace("{category}", category)
    )
    q = re.sub(r"\\s+", " ", q).strip()
    return pid, title, q


def score_candidate(
    *,
    pid: str,
    brand: str,
    title: str,
    query_tokens: List[str],
    prefer_domains: List[str],
    block_domains: List[str],
    cand: Dict[str, Any],
) -> Tuple[float, Optional[str], str]:
    # Returns: (score, imageUrl, reason)
    img = cand.get("image")
    if not isinstance(img, str):
        return (0.0, None, "no-image-field")
    url = normalize_url(img)
    if not url:
        return (0.0, None, "bad-url")

    host = url_host(url)
    title_text = str(cand.get("title") or "")
    page_url = str(cand.get("url") or cand.get("source") or "")

    if host_matches(block_domains, host):
        return (-999.0, None, "blocked-domain")

    if looks_like_logo(url, title_text):
        return (-50.0, None, "looks-like-logo")

    score = 0.0

    # Prefer https.
    if url.lower().startswith("https://"):
        score += 0.5

    # Prefer selected domains.
    if prefer_domains and host_matches(prefer_domains, host):
        score += 4.0

    # Token match against candidate title + page url + image url.
    hay = f"{title_text} {page_url} {url}".lower()
    matches = 0
    for t in query_tokens:
        if t and t in hay:
            matches += 1
    score += min(10.0, float(matches) * 1.25)

    # Brand bonus if present.
    if brand and brand.lower() in hay:
        score += 1.5

    # Product id bonus (sometimes appears in product pages).
    if pid.lower() in hay:
        score += 1.5

    # Penalize extremely generic results.
    if matches <= 1:
        score -= 2.5

    return (score, url, f"matches={matches} host={host}")


def verify_image_url(url: str, timeout_s: float = 8.0) -> bool:
    # Best-effort: check content-type is image/* without downloading the full body.
    try:
        req = urllib.request.Request(
            url,
            method="GET",
            headers={
                "User-Agent": "EcoBrightImageVerifier/1.0",
                "Accept": "image/*,*/*;q=0.8",
                "Range": "bytes=0-2048",
            },
        )
        with urllib.request.urlopen(req, timeout=timeout_s) as resp:
            ct = (resp.headers.get("content-type") or "").lower()
            if ct.startswith("image/"):
                return True
            return False
    except Exception:
        return False


def main() -> int:
    args = parse_args()

    products_path = Path(args.products_json).expanduser().resolve()
    if not products_path.exists():
        print(f"[images] Missing products json: {products_path}", file=sys.stderr)
        return 1

    out_path = Path(args.out).expanduser().resolve()
    report_path = Path(args.report).expanduser().resolve()

    existing = load_existing_updates(out_path)
    failures: List[Dict[str, str]] = []

    products = read_json(products_path)
    if not isinstance(products, list):
        print("[images] products_json must be a JSON array", file=sys.stderr)
        return 1

    if args.limit and args.limit > 0:
        products = products[: args.limit]

    # Filter + prepare work list.
    work: List[Dict[str, Any]] = []
    for row in products:
        if not isinstance(row, dict):
            continue
        pid = str(row.get("id") or "").strip()
        if not pid:
            continue
        if not args.overwrite and pid in existing:
            continue
        if args.only_missing and has_any_image(row):
            continue
        title = pick_title(row)
        if not title:
            continue
        work.append(row)

    if not work:
        print("[images] Nothing to do (all processed / filtered).")
        return 0

    images_per = max(1, int(args.images_per_product))
    concurrency = max(1, int(args.concurrency))
    delay_s = max(0, int(args.delay_ms)) / 1000.0
    min_score = float(args.min_score)

    prefer_domains = [d.strip() for d in str(args.prefer_domains).split(",") if d.strip()]
    block_domains = set(DEFAULT_BLOCK_DOMAINS)
    for d in str(args.block_domains).split(","):
        d = d.strip()
        if d:
            block_domains.add(d)
    block_domains_list = sorted(block_domains)

    candidate_mul = max(2, int(args.candidate_multiplier))

    print(f"[images] Loaded {len(products)} products. Searching {len(work)}. Concurrency={concurrency}.")

    def task(row: Dict[str, Any]) -> Optional[Update]:
        pid, title, q = build_query(args.query_template, row)
        if not q:
            return None
        brand = derive_brand(pid)
        category_hint = pick_category_hint(row)
        query_tokens = tokenize(f"{brand} {title} {category_hint}")

        # Best-effort rate limit per worker.
        if delay_s:
            time.sleep(delay_s)
        try:
            candidates_max = images_per * candidate_mul
            cands = ddg_search_candidates(q, candidates_max)
            scored: List[Tuple[float, str, str]] = []
            for cand in cands:
                sc, u, reason = score_candidate(
                    pid=pid,
                    brand=brand,
                    title=title,
                    query_tokens=query_tokens,
                    prefer_domains=prefer_domains,
                    block_domains=block_domains_list,
                    cand=cand,
                )
                if u:
                    scored.append((sc, u, reason))

            scored.sort(key=lambda x: x[0], reverse=True)

            picked: List[str] = []
            picked_meta: List[Dict[str, Any]] = []
            seen = set()
            for sc, u, reason in scored:
                if len(picked) >= images_per:
                    break
                if sc < min_score:
                    break
                if u in seen:
                    continue
                if args.require_electronics:
                    # Quick keyword guard using the candidate metadata.
                    meta_hay = f"{reason} {u}".lower()
                    tokens = set(tokenize(meta_hay + " " + title))
                    if tokens.intersection(NON_ELECTRONICS_KEYWORDS):
                        continue
                    if not tokens.intersection(ELECTRONICS_KEYWORDS):
                        continue
                if args.verify_content_type and not verify_image_url(u):
                    continue
                seen.add(u)
                picked.append(u)
                picked_meta.append({"score": sc, "url": u, "reason": reason})

            if not picked:
                failures.append({"id": pid, "title": title, "query": q, "error": "no-acceptable-results"})
                return None

            # Attach top picks into the row for report debugging.
            row["_pickedImages"] = picked_meta  # type: ignore
            return Update(id=pid, imageUrls=picked)
        except Exception as e:
            failures.append({"id": pid, "title": title, "query": q, "error": str(e)})
            return None

    updates: Dict[str, Update] = dict(existing)
    done = 0
    checkpoint_every = max(0, int(args.checkpoint_every))

    with ThreadPoolExecutor(max_workers=concurrency) as ex:
        futs = [ex.submit(task, row) for row in work]
        for fut in as_completed(futs):
            res = fut.result()
            done += 1
            if done % 10 == 0 or done == len(work):
                print(f"[images] Progress {done}/{len(work)} updates={len(updates)} failures={len(failures)}")
            if res and res.imageUrls:
                updates[res.id] = res

            if checkpoint_every and (done % checkpoint_every == 0) and done < len(work):
                out_list = [{"id": u.id, "imageUrls": u.imageUrls} for u in updates.values()]
                out_list.sort(key=lambda r: r["id"])
                write_json(out_path, out_list)
                write_json(
                    report_path,
                    {
                        "productsFile": str(products_path),
                        "searched": len(work),
                        "completed": done,
                        "updates": len(out_list),
                        "failures": len(failures),
                        "failureRows": failures[-500:],
                        "queryTemplate": args.query_template,
                        "minScore": min_score,
                        "preferDomains": prefer_domains,
                        "blockDomains": block_domains_list,
                        "candidateMultiplier": candidate_mul,
                        "verifyContentType": bool(args.verify_content_type),
                    },
                )
                print(f"[images] Checkpoint written ({done}/{len(work)})")

    out_list = [{"id": u.id, "imageUrls": u.imageUrls} for u in updates.values()]
    out_list.sort(key=lambda r: r["id"])
    write_json(out_path, out_list)

    # Keep some audit rows for manual review.
    audit_rows: List[Dict[str, Any]] = []
    for row in work[:200]:
        pid = str(row.get("id") or "").strip()
        if not pid:
            continue
        picked = row.get("_pickedImages") if isinstance(row, dict) else None
        if picked:
            audit_rows.append({"id": pid, "title": pick_title(row), "picked": picked})

    write_json(
        report_path,
        {
            "productsFile": str(products_path),
            "searched": len(work),
            "updates": len(out_list),
            "failures": len(failures),
            "failureRows": failures[:5000],
            "queryTemplate": args.query_template,
            "minScore": min_score,
            "preferDomains": prefer_domains,
            "blockDomains": block_domains_list,
            "candidateMultiplier": candidate_mul,
            "verifyContentType": bool(args.verify_content_type),
            "auditSample": audit_rows,
        },
    )

    print(f"[images] Wrote updates: {out_path}")
    print(f"[images] Wrote report:  {report_path}")
    print(
        "[images] Next apply to Neon:\n"
        f"  npx tsx scripts/bulk-update-product-images.ts {out_path}\n"
    )

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
