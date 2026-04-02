import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';

const POSTS_DIR = path.join(process.cwd(), 'content/posts');

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  series?: string;
  seriesOrder?: number;
  tags: string[];
  thumbnail?: string;
  readingTime: string;
}

export interface Post extends PostMeta {
  content: string;
}

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.mdx'));
  const posts = files.map(filename => {
    const slug = filename.replace('.mdx', '');
    const raw = fs.readFileSync(path.join(POSTS_DIR, filename), 'utf-8');
    const { data, content } = matter(raw);
    const rt = readingTime(content);
    return {
      slug,
      title: data.title ?? '',
      description: data.description ?? '',
      date: data.date ?? '',
      series: data.series,
      seriesOrder: data.seriesOrder,
      tags: data.tags ?? [],
      thumbnail: data.thumbnail,
      readingTime: `${Math.ceil(rt.minutes)}분`,
    } as PostMeta;
  });
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPost(slug: string): Post | null {
  const filepath = path.join(POSTS_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filepath)) return null;
  const raw = fs.readFileSync(filepath, 'utf-8');
  const { data, content } = matter(raw);
  const rt = readingTime(content);
  return {
    slug,
    title: data.title ?? '',
    description: data.description ?? '',
    date: data.date ?? '',
    series: data.series,
    seriesOrder: data.seriesOrder,
    tags: data.tags ?? [],
    thumbnail: data.thumbnail,
    readingTime: `${Math.ceil(rt.minutes)}분`,
    content,
  };
}

export function getSeriesPosts(series: string): PostMeta[] {
  return getAllPosts()
    .filter(p => p.series === series)
    .sort((a, b) => (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0));
}

export function getAllSeries(): string[] {
  const all = getAllPosts().map(p => p.series).filter(Boolean) as string[];
  return [...new Set(all)];
}
