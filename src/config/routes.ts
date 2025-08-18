export const ROUTES = {
  home: "/",
  articles: {
    index: "/articles",
    detail: (slug: string) => `/articles/${slug}`,
  },
  donate: {
    index: "/donate",
    cancel: "/donate/cancel",
    complete: "/donate/complete",
  },
  forestCup: {
    index: "/forest-cup",
    edition: (edition: number) => `/forest-cup/${edition}`,
  },
  members: {
    index: "/members",
    detail: (slug: string) => `/members/${slug}`,
  },
  championsLeague: "/champions-league", // Disabled
  ranking: "/ranking",
  sponsor: "/sponsor",
  test: "/test",
  notFound: "/404",
} as const;
