"use client";

import type { CSSProperties, ReactNode } from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { BlogArticleToc } from "@/features/blog/components/BlogArticleToc";
import type { BlogPostHeading } from "@/features/blog/content/posts";

type BlogArticleFrameProps = {
  accent?: string;
  headings: BlogPostHeading[];
  backLink: ReactNode;
  meta: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
};

export function BlogArticleFrame({ accent, headings, backLink, meta, title, description, children }: BlogArticleFrameProps) {
  const minimumTocTop = 84;
  const articleRef = useRef<HTMLElement>(null);
  const [isTocVisible, setIsTocVisible] = useState(headings.length > 0);
  const [tocTop, setTocTop] = useState(minimumTocTop);
  const hasHeadings = headings.length > 0;

  useLayoutEffect(() => {
    let animationFrame = 0;

    function updateTocTop() {
      const articleTop = articleRef.current?.getBoundingClientRect().top ?? minimumTocTop;
      setTocTop(Math.max(minimumTocTop, articleTop));
    }

    function scheduleTocTopUpdate() {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(updateTocTop);
    }

    updateTocTop();
    window.addEventListener("resize", scheduleTocTopUpdate);
    window.addEventListener("scroll", scheduleTocTopUpdate, { passive: true });

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", scheduleTocTopUpdate);
      window.removeEventListener("scroll", scheduleTocTopUpdate);
    };
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
          <header className="blog-article-header">
            <p className="blog-article-kicker">Article</p>
            <h1>{title}</h1>
            <p>{description}</p>
          </header>
          {children}
        </div>
      </article>
      {isTocVisible ? <BlogArticleToc headings={headings} /> : null}
    </div>
  );
}
