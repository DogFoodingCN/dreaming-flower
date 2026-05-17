import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { BlogShell } from "@/components/blog/BlogShell";
import { getBlogPost, getBlogPosts } from "@/lib/blog";

type BlogDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return {};
  }

  return {
    title: `${post.title} | Dreaming Flower`,
    description: post.description,
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <BlogShell title={post.title} description={post.description}>
      <article className="blog-article" style={{ "--blog-accent": post.themeAccent } as CSSProperties}>
        <Link className="blog-back-link" href="/blog" aria-label="返回博客列表">
          <span aria-hidden="true">←</span>
          返回博客列表
        </Link>
        <time dateTime={post.date}>{post.date}</time>
        <div className="blog-prose">
          <MDXRemote source={post.content} />
        </div>
      </article>
    </BlogShell>
  );
}
