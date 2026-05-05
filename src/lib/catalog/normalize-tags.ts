function canonicalizeTag(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  return trimmed
    .replace(/\s*:\s*/g, ":")
    .replace(/\s+/g, " ");
}

export function normalizeTags(input: {
  rawTags: string;
  packQty?: number | null;
  rawPackQty?: string | null;
  holeSize?: string | null;
  hasAlternatePrice?: boolean;
}) {
  const tags = new Map<string, string>();

  input.rawTags
    .split(",")
    .map(canonicalizeTag)
    .filter((tag): tag is string => tag !== null)
    .forEach((tag) => {
      tags.set(tag.toLowerCase(), tag);
    });

  if (input.packQty) {
    const tag = `Pack:${input.packQty}`;
    tags.set(tag.toLowerCase(), tag);
  } else if (input.rawPackQty?.trim()) {
    const tag = canonicalizeTag(`Pack:${input.rawPackQty.trim()}`);
    if (tag) {
      tags.set(tag.toLowerCase(), tag);
    }
  }

  if (input.holeSize?.trim()) {
    const tag = `Hole:${input.holeSize.trim()}`;
    tags.set(tag.toLowerCase(), tag);
  }

  if (input.hasAlternatePrice) {
    tags.set("3colors", "3Colors");
  }

  return Array.from(tags.values());
}
