import type { ReactNode } from "react";

/**
 * Renders article body text (markdown-lite) as safe React elements —
 * no dangerouslySetInnerHTML, so admin-entered content can't inject markup.
 *
 * Supported syntax:
 *   ## หัวข้อ        → <h2>
 *   ### หัวข้อย่อย   → <h3>
 *   - รายการ / * รายการ → <ul><li>
 *   1. รายการ        → <ol><li>
 *   **ตัวหนา**       → <strong>
 *   [ข้อความ](/path) → <a> (internal or https links only)
 *   บรรทัดว่าง        → paragraph break
 */

const INLINE_PATTERN =
  /(\*\*[^*]+\*\*|\[[^\]]+\]\((?:https?:\/\/|\/)[^)\s]+\))/g;

function renderInline(text: string): ReactNode[] {
  return text.split(INLINE_PATTERN).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    const link = part.match(/^\[([^\]]+)\]\(((?:https?:\/\/|\/)[^)\s]+)\)$/);
    if (link) {
      const external = link[2].startsWith("http");
      return (
        <a
          key={i}
          href={link[2]}
          {...(external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {link[1]}
        </a>
      );
    }
    return part;
  });
}

type Block =
  | { type: "h2" | "h3" | "p"; text: string }
  | { type: "ul" | "ol"; items: string[] };

function parseBlocks(content: string): Block[] {
  const blocks: Block[] = [];
  let paragraph: string[] = [];

  const flush = () => {
    if (paragraph.length > 0) {
      blocks.push({ type: "p", text: paragraph.join(" ") });
      paragraph = [];
    }
  };

  for (const raw of content.split(/\r?\n/)) {
    const line = raw.trim();
    if (line === "") {
      flush();
    } else if (line.startsWith("### ")) {
      flush();
      blocks.push({ type: "h3", text: line.slice(4) });
    } else if (line.startsWith("## ")) {
      flush();
      blocks.push({ type: "h2", text: line.slice(3) });
    } else if (/^[-*] /.test(line)) {
      flush();
      const last = blocks[blocks.length - 1];
      const item = line.slice(2);
      if (last?.type === "ul") last.items.push(item);
      else blocks.push({ type: "ul", items: [item] });
    } else if (/^\d+\. /.test(line)) {
      flush();
      const last = blocks[blocks.length - 1];
      const item = line.replace(/^\d+\. /, "");
      if (last?.type === "ol") last.items.push(item);
      else blocks.push({ type: "ol", items: [item] });
    } else {
      paragraph.push(line);
    }
  }
  flush();
  return blocks;
}

export function ArticleContent({ content }: { content: string }) {
  const blocks = parseBlocks(content);
  return (
    <div className="prose-thai">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "h2":
            return <h2 key={i}>{renderInline(block.text)}</h2>;
          case "h3":
            return <h3 key={i}>{renderInline(block.text)}</h3>;
          case "ul":
            return (
              <ul key={i}>
                {block.items.map((item, j) => (
                  <li key={j}>{renderInline(item)}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i}>
                {block.items.map((item, j) => (
                  <li key={j}>{renderInline(item)}</li>
                ))}
              </ol>
            );
          default:
            return <p key={i}>{renderInline(block.text)}</p>;
        }
      })}
    </div>
  );
}
