import type { CollectionEntry } from 'astro:content';

type ArticleEntry = CollectionEntry<'articles'>;

export function getArticlesByTags(articles: ArticleEntry[], tags: string[] = []): ArticleEntry[] {
  const filtered = tags.length === 0
    ? articles
    : articles.filter(a =>
        Array.isArray(a.data.tags) &&
        a.data.tags.some(t => tags.includes(t))
      );
  return filtered.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

// This is for external hosted images
export const isExternalUrl = (src: unknown): src is string =>
  typeof src === 'string' && src.startsWith('http');