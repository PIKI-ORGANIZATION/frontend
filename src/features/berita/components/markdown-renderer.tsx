import React from "react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Parses inline markdown: **bold**, *italic*, `code`, and [link](url)
 */
function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  // Regex matches:
  // 1. Bold: **text**
  // 2. Italic: *text* or _text_
  // 3. Inline Code: `text`
  // 4. Link: [text](url)
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const token = match[0];
    const key = `inline-${match.index}`;

    if (token.startsWith("**") && token.endsWith("**")) {
      parts.push(
        <strong key={key} className="font-semibold text-foreground">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("*") && token.endsWith("*")) {
      parts.push(
        <em key={key} className="italic text-foreground/90">
          {token.slice(1, -1)}
        </em>
      );
    } else if (token.startsWith("`") && token.endsWith("`")) {
      parts.push(
        <code
          key={key}
          className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith("[") && token.includes("](")) {
      const linkMatch = token.match(/\[(.*?)\]\((.*?)\)/);
      if (linkMatch) {
        parts.push(
          <a
            key={key}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-4 hover:text-primary/80 font-medium"
          >
            {linkMatch[1]}
          </a>
        );
      } else {
        parts.push(token);
      }
    } else {
      parts.push(token);
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  if (!content) return null;

  // Split into block sections separated by double newlines
  const blocks = content.split(/\n\s*\n/);

  return (
    <div className={`space-y-4 text-sm leading-relaxed text-foreground/90 font-sans ${className}`}>
      {blocks.map((block, idx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // Heading 2
        if (trimmed.startsWith("## ")) {
          return (
            <h2
              key={idx}
              className="text-lg sm:text-xl font-bold tracking-tight text-foreground border-b border-border/50 pb-2 pt-3"
            >
              {renderInline(trimmed.replace(/^##\s+/, ""))}
            </h2>
          );
        }

        // Heading 3
        if (trimmed.startsWith("### ")) {
          return (
            <h3
              key={idx}
              className="text-base sm:text-lg font-semibold tracking-tight text-foreground pt-2"
            >
              {renderInline(trimmed.replace(/^###\s+/, ""))}
            </h3>
          );
        }

        // Blockquote
        if (trimmed.startsWith("> ")) {
          const quoteLines = trimmed
            .split("\n")
            .map((line) => line.replace(/^>\s?/, ""))
            .join(" ");
          return (
            <blockquote
              key={idx}
              className="border-l-3 border-primary bg-primary/5 pl-4 py-3 my-4 italic text-muted-foreground rounded-r-md text-sm leading-relaxed"
            >
              {renderInline(quoteLines)}
            </blockquote>
          );
        }

        // Numbered List
        if (/^\d+\.\s/.test(trimmed)) {
          const items = trimmed.split("\n").filter((l) => l.trim().length > 0);
          return (
            <ol key={idx} className="list-decimal pl-5 space-y-1.5 my-3 text-sm">
              {items.map((item, itemIdx) => (
                <li key={itemIdx} className="pl-1">
                  {renderInline(item.replace(/^\d+\.\s+/, ""))}
                </li>
              ))}
            </ol>
          );
        }

        // Bullet List
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const items = trimmed.split("\n").filter((l) => l.trim().length > 0);
          return (
            <ul key={idx} className="list-disc pl-5 space-y-1.5 my-3 text-sm">
              {items.map((item, itemIdx) => (
                <li key={itemIdx} className="pl-1">
                  {renderInline(item.replace(/^[-*]\s+/, ""))}
                </li>
              ))}
            </ul>
          );
        }

        // Standard Paragraph
        return (
          <p key={idx} className="leading-relaxed">
            {renderInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
}
