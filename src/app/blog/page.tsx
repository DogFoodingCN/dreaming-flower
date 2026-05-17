import type { CSSProperties } from "react";
import Link from "next/link";
import { BlogShell } from "@/features/blog/components/BlogShell";
import { getBlogPosts } from "@/features/blog/content/posts";

export const metadata = {
  title: "博客 | Dreaming Flower",
  description: "Dreaming Flower 的产品体验、个人表达和持续写作。",
};

export default function BlogPage() {
  const posts = getBlogPosts();

  return (
    <BlogShell title="繁花笔记" description="记录产品体验、个人表达和 Dreaming Flower 的生长过程。">
      <section className="blog-list" aria-label="博客文章列表">
        {posts.map((post) => (
          <Link key={post.slug} className="blog-card" href={`/blog/${post.slug}`} style={{ "--blog-accent": post.themeAccent } as CSSProperties}>
            <time dateTime={post.date}>{post.date}</time>
            <h2>{post.title}</h2>
            <p>{post.excerpt}</p>
            <span>阅读全文</span>
          </Link>
        ))}
      </section>
    </BlogShell>
  );
}
