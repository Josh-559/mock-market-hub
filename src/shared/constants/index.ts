export const ROUTES = {
  HOME: '/',
  MARKETS: '/markets',
  MARKET: (id: string) => `/market/${id}`,
  PORTFOLIO: '/portfolio',
} as const;

export const QUICK_AMOUNTS = [10, 25, 50, 100, 250];

export const CATEGORIES = [
  { id: 'all', label: 'All Markets' },
  { id: 'crypto', label: 'Crypto' },
  { id: 'economics', label: 'Economics' },
  { id: 'politics', label: 'Politics' },
  { id: 'sports', label: 'Sports' },
  { id: 'science', label: 'Science' },
  { id: 'tech', label: 'Tech' },
] as const;
