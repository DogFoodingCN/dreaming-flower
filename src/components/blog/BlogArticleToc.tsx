"use client";

import type { BlogPostHeading } from "@/lib/blog";

type BlogArticleTocProps = {
  headings: BlogPostHeading[];
};

export function BlogArticleToc({ headings }: BlogArticleTocProps) {
  if (headings.length === 0) {
    return null;
  }

  return (
    <aside className="blog-toc" aria-label="文章概览">
      <nav className="blog-toc-panel">
        <p>文章概览</p>
        {headings.map((heading) => (
          <a key={heading.id} className={`blog-toc-link blog-toc-link--h${heading.level}`} href={`#${heading.id}`}>
            {heading.text}
          </a>
        ))}
      </nav>
    </aside>
  );
}
