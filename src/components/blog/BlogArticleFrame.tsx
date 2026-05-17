"use client";

import type { CSSProperties, ReactNode } from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { BlogArticleToc } from "@/components/blog/BlogArticleToc";
import type { BlogPostHeading } from "@/lib/blog";

type BlogArticleFrameProps = {
  accent?: string;
  headings: BlogPostHeading[];
  backLink: ReactNode;
  meta: ReactNode;
  children: ReactNode;
};

export function BlogArticleFrame({ accent, headings, backLink, meta, children }: BlogArticleFrameProps) {
  const articleRef = useRef<HTMLElement>(null);
  const [isTocVisible, setIsTocVisible] = useState(headings.length > 0);
  const [tocTop, setTocTop] = useState(0);
  const hasHeadings = headings.length > 0;

  useLayoutEffect(() => {
    function updateTocTop() {
      const articleTop = articleRef.current?.getBoundingClientRect().top ?? 0;
      setTocTop(Math.max(0, articleTop));
    }

    updateTocTop();
    window.addEventListener("resize", updateTocTop);
    return () => window.removeEventListener("resize", updateTocTop);
  }, []);

  return (
    <div
      className={isTocVisible ? "blog-article-layout" : "blog-article-layout blog-article-layout--centered"}
      style={{ "--blog-accent": accent, "--blog-toc-top": `${tocTop}px` } as CSSProperties}
    >
      <article ref={articleRef} className="blog-article">
        <div className="blog-article-main">
          <div className="blog-article-actions">
            {backLink}
            <div className="blog-article-actions-right">
              {meta}
              {hasHeadings ? (
                <button type="button" className="blog-toc-toggle" onClick={() => setIsTocVisible((current) => !current)}>
                  {isTocVisible ? "隐藏概览" : "显示概览"}
                </button>
              ) : null}
            </div>
          </div>
          {children}
        </div>
      </article>
      {isTocVisible ? <BlogArticleToc headings={headings} /> : null}
    </div>
  );
}
