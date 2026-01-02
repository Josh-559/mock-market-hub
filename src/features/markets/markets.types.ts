export interface MarketOption {
  label: string;
  price: number;
}

export interface Market {
  id: string;
  title: string;
  description: string;
  category: MarketCategory;
  status: 'active' | 'resolved' | 'pending';
  volume: number;
  liquidity: number;
  yesPrice: number;
  noPrice: number;
  createdAt: string;
  endsAt: string;
  imageUrl?: string;
  options?: MarketOption[];
  resolvedOutcome?: 'yes' | 'no';
}

export type MarketCategory = 
  | 'crypto'
  | 'economics'
  | 'politics'
  | 'sports'
  | 'science'
  | 'tech'
  | 'entertainment'
  | 'other';

export interface MarketFilters {
  category?: MarketCategory;
  status?: Market['status'];
  search?: string;
  sortBy?: 'volume' | 'liquidity' | 'ending' | 'newest';
}

export const CATEGORY_LABELS: Record<MarketCategory, string> = {
  crypto: 'Crypto',
  economics: 'Economics',
  politics: 'Politics',
  sports: 'Sports',
  science: 'Science',
  tech: 'Tech',
  entertainment: 'Entertainment',
  other: 'Other',
};

export const CATEGORY_ICONS: Record<MarketCategory, string> = {
  crypto: '₿',
  economics: '📈',
  politics: '🏛️',
  sports: '⚽',
  science: '🔬',
  tech: '💻',
  entertainment: '🎬',
  other: '📌',
};
