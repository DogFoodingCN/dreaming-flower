import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const BLOG_DIRECTORY = path.join(process.cwd(), "content/blog");

export type BlogPost = {
  title: string;
  description: string;
  date: string;
  slug: string;
  excerpt: string;
  themeAccent?: string;
  content: string;
};

export type BlogPostSummary = Omit<BlogPost, "content">;

function readPostFile(fileName: string): BlogPost {
  const filePath = path.join(BLOG_DIRECTORY, fileName);
  const source = fs.readFileSync(filePath, "utf8");
  const { content, data } = matter(source);

  return {
    title: String(data.title),
    description: String(data.description),
    date: String(data.date),
    slug: String(data.slug ?? fileName.replace(/\.mdx$/, "")),
    excerpt: String(data.excerpt ?? data.description),
    themeAccent: data.themeAccent ? String(data.themeAccent) : undefined,
    content,
  };
}

export function getBlogPosts(): BlogPostSummary[] {
  return fs
    .readdirSync(BLOG_DIRECTORY)
    .filter((fileName) => fileName.endsWith(".mdx"))
    .map(readPostFile)
    .map((post) => {
      const { content, ...summary } = post;
      void content;
      return summary;
    })
    .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime());
}

export function getBlogPost(slug: string): BlogPost | null {
  const fileName = `${slug}.mdx`;

  if (!fs.existsSync(path.join(BLOG_DIRECTORY, fileName))) {
    return null;
  }

  return readPostFile(fileName);
}
