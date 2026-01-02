import type { MarketDetail, OrderBook, PricePoint } from './market.types';

export const mockMarketDetails: Record<string, Omit<MarketDetail, 'priceHistory'>> = {
  'btc-100k-2026': {
    id: 'btc-100k-2026',
    title: 'Bitcoin to reach $100K by end of 2026?',
    description: 'This market will resolve to YES if Bitcoin reaches or exceeds $100,000 USD on any major exchange before January 1, 2027.',
    category: 'crypto',
    status: 'active',
    volume: 2847592,
    liquidity: 458920,
    yesPrice: 0.72,
    noPrice: 0.28,
    createdAt: '2025-06-15T00:00:00Z',
    endsAt: '2026-12-31T23:59:59Z',
  },
  'fed-rate-cut-q1': {
    id: 'fed-rate-cut-q1',
    title: 'Fed to cut rates in Q1 2026?',
    description: 'Will the Federal Reserve announce a rate cut during the first quarter of 2026?',
    category: 'economics',
    status: 'active',
    volume: 1523847,
    liquidity: 312450,
    yesPrice: 0.45,
    noPrice: 0.55,
    createdAt: '2025-11-01T00:00:00Z',
    endsAt: '2026-03-31T23:59:59Z',
  },
};

export function generatePriceHistory(basePrice: number, points: number = 50): PricePoint[] {
  const history: PricePoint[] = [];
  const now = Math.floor(Date.now() / 1000);
  const interval = 3600; // 1 hour
  
  let currentPrice = basePrice - 0.1 + Math.random() * 0.05;
  
  for (let i = points; i >= 0; i--) {
    // Random walk with slight upward bias toward current price
    const drift = (basePrice - currentPrice) * 0.1;
    const randomness = (Math.random() - 0.5) * 0.04;
    currentPrice = Math.max(0.01, Math.min(0.99, currentPrice + drift + randomness));
    
    history.push({
      time: now - i * interval,
      value: currentPrice,
    });
  }
  
  // Ensure last point matches current price
  history[history.length - 1].value = basePrice;
  
  return history;
}

export const mockOrderBooks: Record<string, OrderBook> = {
  'btc-100k-2026': {
    bids: [
      { price: 0.71, quantity: 12500 },
      { price: 0.70, quantity: 8900 },
      { price: 0.69, quantity: 15200 },
      { price: 0.68, quantity: 22400 },
      { price: 0.67, quantity: 18700 },
      { price: 0.66, quantity: 9800 },
      { price: 0.65, quantity: 31200 },
    ],
    asks: [
      { price: 0.73, quantity: 11200 },
      { price: 0.74, quantity: 9400 },
      { price: 0.75, quantity: 18900 },
      { price: 0.76, quantity: 14500 },
      { price: 0.77, quantity: 21300 },
      { price: 0.78, quantity: 8900 },
      { price: 0.79, quantity: 25600 },
    ],
  },
  'fed-rate-cut-q1': {
    bids: [
      { price: 0.44, quantity: 8900 },
      { price: 0.43, quantity: 12400 },
      { price: 0.42, quantity: 18700 },
      { price: 0.41, quantity: 9200 },
      { price: 0.40, quantity: 25800 },
    ],
    asks: [
      { price: 0.46, quantity: 7800 },
      { price: 0.47, quantity: 11200 },
      { price: 0.48, quantity: 15600 },
      { price: 0.49, quantity: 8900 },
      { price: 0.50, quantity: 22100 },
    ],
  },
};
