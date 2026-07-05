/**
 * Injects a <script type="application/ld+json"> tag for structured data.
 * Accepts either a single JSON-LD object or an array of them.
 * Used across the site for SEO / AEO / GEO / LLMO.
 */
type JsonLdObject = Record<string, unknown>;

export function JsonLd({ data }: { data: JsonLdObject | JsonLdObject[] }) {
  const json = Array.isArray(data) ? data : [data];
  return (
    <>
      {json.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          // Data is built server-side from trusted constants/DB rows.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}
