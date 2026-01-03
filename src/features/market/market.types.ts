import type { MarketOutcome } from '@/features/markets/markets.types';

export type MarketType = 'binary' | 'multi_outcome';

export interface MarketDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'active' | 'resolved' | 'pending';
  type?: MarketType;
  volume: number;
  liquidity: number;
  yesPrice: number;
  noPrice: number;
  createdAt: string;
  endsAt: string;
  priceHistory: PricePoint[];
  imageUrl?: string;
  resolvedOutcome?: 'yes' | 'no' | string;
  resolutionDate?: string;
  outcomes?: MarketOutcome[];
  orderBook?: OrderBook;
}

export interface PricePoint {
  time: number;
  value: number;
}

export interface OrderBookEntry {
  price: number;
  quantity: number;
}

export interface OrderBook {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
}

export interface Trade {
  id: string;
  marketId: string;
  side: 'yes' | 'no';
  type: 'buy' | 'sell';
  price: number;
  quantity: number;
  timestamp: string;
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  content: string;
  timestamp: string;
  likes: number;
  holderPosition?: number;
  holderDate?: string;
  replies?: Comment[];
}
