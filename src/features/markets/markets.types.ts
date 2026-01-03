export type MarketCategory = 
  | 'crypto'
  | 'economics'
  | 'politics'
  | 'sports'
  | 'science'
  | 'tech'
  | 'entertainment'
  | 'other';

export type MarketType = 'binary' | 'multi_outcome';

export interface MarketOutcome {
  id: string;
  label: string;
  yesPrice: number;
  noPrice: number;
  volume?: number;
  imageUrl?: string;
}

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
  type?: MarketType;
  volume: number;
  liquidity: number;
  yesPrice: number;
  noPrice: number;
  createdAt: string;
  endsAt: string;
  imageUrl?: string;
  options?: MarketOption[];
  outcomes?: MarketOutcome[];
  resolvedOutcome?: 'yes' | 'no' | string;
}

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
