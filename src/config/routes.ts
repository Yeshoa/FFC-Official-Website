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
    season: (season: number) => `/forest-cup/${season}/`,
  },
  championsLeague:{
    index: "/forestian-champions-league/",
    season: (season: number) => `/forestian-champions-league/${season}/`,
    market: "/forestian-champions-league/market/",
    ranking: "/forestian-champions-league/ranking/",
    leagues: "/forestian-champions-league/leagues/",
  },
  members: {
    index: "/members/",
    detail: (slug: string) => `/members/${slug}/`,
    achievements: (slug: string) => `/members/${slug}/achievements/`,
  },
  clubs: {
    index: "/clubs/",
    detail: (code: string) => `/clubs/${code}/`,
  },
  matches: {
    index: "/matches/",
    detail: (slug: string) => `/matches/${slug}/`, 
  },
  stadiums: {
    index: "/stadiums/",
    // detail: (slug: string) => `/stadiums/${slug}/`,
  },
  sponsors: {
    index: "/sponsors/",
    // detail: (slug: string) => `/sponsors/${slug}/`,
  },
  ranking: "/ranking/",
  rankingDetailed: "/ranking-detailed/",
  test: "/test/",
  notFound: "/404/",
} as const;
