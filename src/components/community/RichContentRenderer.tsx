"use client";

import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { parseRichContent } from "@/lib/community/rich-content";

export function RichContentRenderer({ body, className = "" }: { body: string; className?: string }) {
  const blocks = parseRichContent(body);

  return (
    <article className={`rich-content ${className}`}>
      {blocks.map((block, i) => {
        if (block.type === "heading") {
          const Tag = block.level === 1 ? "h2" : block.level === 2 ? "h3" : "h4";
          return (
            <Tag
              key={i}
              className="rich-content__heading font-display font-bold text-navy"
              dangerouslySetInnerHTML={{ __html: block.html }}
            />
          );
        }
        if (block.type === "image") {
          return (
            <figure key={i} className="rich-content__figure">
              <div className="rich-content__image-wrap">
                <Image
                  src={block.src}
                  alt={block.alt.trim() || "Image in post"}
                  width={960}
                  height={540}
                  className="rich-content__image"
                />
              </div>
            </figure>
          );
        }
        if (block.type === "link-card") {
          return (
            <a
              key={i}
              href={block.href}
              target="_blank"
              rel="noopener noreferrer"
              className="rich-content__link-card group"
            >
              <span className="rich-content__link-card-label">{block.label}</span>
              <span className="rich-content__link-card-url">{block.href}</span>
              <ExternalLink className="rich-content__link-card-icon h-4 w-4 shrink-0 opacity-50 group-hover:opacity-100" />
            </a>
          );
        }
        return (
          <p
            key={i}
            className="rich-content__paragraph"
            dangerouslySetInnerHTML={{ __html: block.html }}
          />
        );
      })}
    </article>
  );
}
