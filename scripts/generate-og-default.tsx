/**
 * Regenerates public/og-default.png (1200x630) — the fallback link-preview image.
 * Usage: npx tsx scripts/generate-og-default.tsx && sips -s format jpeg -s formatOptions 85 public/og-default.png --out public/og-default.jpg && rm public/og-default.png
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

async function main() {
  const root = process.cwd();
  const logo = await readFile(path.join(root, "public/ecobright-logo.jpeg"));
  const logoSrc = `data:image/jpeg;base64,${logo.toString("base64")}`;

  const response = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          background: "#ffffff",
          padding: "0 80px",
          gap: 56,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={460} height={460} alt="" />
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 76, fontWeight: 700, color: "#2f7d32", lineHeight: 1 }}>
            LED & Solar
          </div>
          <div style={{ fontSize: 40, color: "#1f2937", lineHeight: 1.25, maxWidth: 520 }}>
            Lighting and solar products in Cambodia
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 16,
              fontSize: 34,
              fontWeight: 700,
              color: "#ffffff",
              background: "#2f7d32",
              padding: "14px 28px",
              borderRadius: 16,
              alignSelf: "flex-start",
            }}
          >
            ecobright.store
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );

  const out = path.join(root, "public/og-default.png");
  await writeFile(out, Buffer.from(await response.arrayBuffer()));
  console.log(`Wrote ${out}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
