export interface MarketDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'active' | 'resolved' | 'pending';
  volume: number;
  liquidity: number;
  yesPrice: number;
  noPrice: number;
  createdAt: string;
  endsAt: string;
  priceHistory: PricePoint[];
  imageUrl?: string;
  resolvedOutcome?: 'yes' | 'no';
  resolutionDate?: string;
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
  replies?: Comment[];
}
