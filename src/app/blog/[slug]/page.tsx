import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { BlogArticleFrame } from "@/features/blog/components/BlogArticleFrame";
import { BlogShell } from "@/features/blog/components/BlogShell";
import { getBlogPost, getBlogPosts } from "@/features/blog/content/posts";
import { blogMdxComponents } from "@/features/blog/mdx/components";
import { blogMdxOptions } from "@/features/blog/mdx/options";

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
      <BlogArticleFrame
        accent={post.themeAccent}
        headings={post.headings}
        backLink={
          <Link className="blog-back-link" href="/blog" aria-label="返回博客列表">
            <span aria-hidden="true">←</span>
            返回博客列表
          </Link>
        }
        meta={<time dateTime={post.date}>{post.date}</time>}
        title={post.title}
        description={post.description}
      >
        <div className="blog-prose">
          <MDXRemote source={post.content} components={blogMdxComponents} options={blogMdxOptions} />
        </div>
      </BlogArticleFrame>
    </BlogShell>
  );
}
