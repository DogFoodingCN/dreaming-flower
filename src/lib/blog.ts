import fs from "node:fs";
import path from "node:path";
import GithubSlugger from "github-slugger";
import matter from "gray-matter";

const BLOG_DIRECTORY = path.join(process.cwd(), "content/blog");

export type BlogPostHeading = {
  id: string;
  text: string;
  level: 2 | 3;
};

export type BlogPost = {
  title: string;
  description: string;
  date: string;
  slug: string;
  excerpt: string;
  themeAccent?: string;
  content: string;
  headings: BlogPostHeading[];
};

export type BlogPostSummary = Omit<BlogPost, "content" | "headings">;

function stripInlineMarkdown(value: string) {
  return value
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
    .replace(/[\\*_~]/g, "")
    .trim();
}

function getPostHeadings(content: string): BlogPostHeading[] {
  const slugger = new GithubSlugger();

  return content
    .split("\n")
    .map((line) => line.match(/^(#{2,3})\s+(.+)$/))
    .filter((match): match is RegExpMatchArray => Boolean(match))
    .map((match) => {
      const text = stripInlineMarkdown(match[2]);

      return {
        id: slugger.slug(text),
        text,
        level: match[1].length as 2 | 3,
      };
    });
}

function readPostFile(fileName: string): BlogPost {
  const filePath = path.join(BLOG_DIRECTORY, fileName);
  const source = fs.readFileSync(filePath, "utf8");
  const { content, data } = matter(source);

  return {
    title: String(data.title),
    description: String(data.description),
    date: String(data.date),
    slug: fileName.replace(/\.mdx$/, ""),
    excerpt: String(data.excerpt ?? data.description),
    themeAccent: data.themeAccent ? String(data.themeAccent) : undefined,
    content,
    headings: getPostHeadings(content),
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
