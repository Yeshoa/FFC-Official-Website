export const ROUTES = {
  home: "/",
  articles: {
    index: "/articles/",
    detail: (slug: string) => `/articles/${slug}/`,
  },
  donate: {
    index: "/donate/",
    cancel: "/donate/cancel",
    complete: "/donate/complete",
  },
  forestCup: {
    index: "/forest-cup/",
    edition: (edition: number) => `/forest-cup/${edition}/`,
  },
  championsLeague:{
    index: "/champions-league/",
    edition: (edition: number) => `/champions-league/${edition}/`,
  },
  members: {
    index: "/members/",
    detail: (slug: string) => `/members/${slug}/`,
  },
  matches: {
    index: "/matches/",
    detail: (slug: string) => `/matches/${slug}/`, 
  },
  stadiums: {
    index: "/stadiums/",
    detail: (slug: string) => `/stadiums/${slug}/`,
  },
  ranking: "/ranking/",
  sponsor: "/sponsor/",
  test: "/test/",
  notFound: "/404/",
} as const;
