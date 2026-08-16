import type { CollectionEntry } from 'astro:content';

type ArticleEntry = CollectionEntry<'articles'>;

export function getArticlesByTags(
  articles: ArticleEntry[],
  tags: string[] = [],
  excludeTags: string[] = [],
): ArticleEntry[] {
  const filtered = tags.length === 0
    ? articles
    : articles.filter(a =>
        Array.isArray(a.data.tags) &&
        a.data.tags.some(t => tags.includes(t))
      );
  const excluded = excludeTags.length === 0
    ? filtered
    : filtered.filter(a =>
        !(Array.isArray(a.data.tags) && a.data.tags.some(t => excludeTags.includes(t)))
      );
  return excluded.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

// This is for external hosted images
export const isExternalUrl = (src: unknown): src is string =>
  typeof src === 'string' && src.startsWith('http');