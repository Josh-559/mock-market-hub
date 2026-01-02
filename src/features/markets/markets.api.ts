import { mockFetch } from '@/services/mockHttp';
import { mockMarkets } from './markets.mock';
import type { Market, MarketFilters } from './markets.types';

export async function fetchMarkets(filters?: MarketFilters): Promise<Market[]> {
  let markets = [...mockMarkets];
  
  if (filters?.category) {
    markets = markets.filter((m) => m.category === filters.category);
  }
  
  if (filters?.status) {
    markets = markets.filter((m) => m.status === filters.status);
  }
  
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    markets = markets.filter(
      (m) =>
        m.title.toLowerCase().includes(searchLower) ||
        m.description.toLowerCase().includes(searchLower)
    );
  }
  
  if (filters?.sortBy) {
    switch (filters.sortBy) {
      case 'volume':
        markets.sort((a, b) => b.volume - a.volume);
        break;
      case 'liquidity':
        markets.sort((a, b) => b.liquidity - a.liquidity);
        break;
      case 'ending':
        markets.sort((a, b) => new Date(a.endsAt).getTime() - new Date(b.endsAt).getTime());
        break;
      case 'newest':
        markets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }
  }
  
  return mockFetch(markets);
}

export async function fetchMarketById(id: string): Promise<Market | null> {
  const market = mockMarkets.find((m) => m.id === id);
  return mockFetch(market || null);
}
