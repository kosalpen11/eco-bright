import { serializeJsonLd } from "@/lib/structured-data";

/** Server-rendered JSON-LD block. Pass one schema object or an array of them. */
export function JsonLd({ data }: { data: Record<string, unknown> | Array<Record<string, unknown>> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
