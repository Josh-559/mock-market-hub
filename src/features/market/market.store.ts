import { create } from 'zustand';
import type { MarketDetail, OrderBook, Trade, PricePoint } from './market.types';
import type { Market } from '@/features/markets/markets.types';
import marketsData from '@/mocks/markets.json';
import { mockSocket } from '@/services/mockSocket';

// Load markets from JSON
const allMarkets: Market[] = marketsData as Market[];

// Generate price history for a market
function generatePriceHistory(basePrice: number, points: number = 50): PricePoint[] {
  const history: PricePoint[] = [];
  const now = Date.now();
  const interval = 3600 * 1000; // 1 hour in ms
  
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

// Generate mock orderbook
function generateOrderBook(yesPrice: number): OrderBook {
  const bids: { price: number; quantity: number }[] = [];
  const asks: { price: number; quantity: number }[] = [];
  
  for (let i = 1; i <= 7; i++) {
    bids.push({
      price: Math.max(0.01, yesPrice - i * 0.01),
      quantity: Math.floor(5000 + Math.random() * 20000),
    });
    asks.push({
      price: Math.min(0.99, yesPrice + i * 0.01),
      quantity: Math.floor(5000 + Math.random() * 20000),
    });
  }
  
  return { bids, asks };
}

interface MarketState {
  currentMarket: MarketDetail | null;
  orderBook: OrderBook | null;
  recentTrades: Trade[];
  isLoading: boolean;
  error: string | null;
  priceFlash: 'up' | 'down' | null;
  
  // Actions
  loadMarket: (marketId: string) => Promise<void>;
  updatePrice: (yesPrice: number) => void;
  addTrade: (trade: Trade) => void;
  subscribeToUpdates: (marketId: string) => () => void;
}

export const useMarketStore = create<MarketState>((set, get) => ({
  currentMarket: null,
  orderBook: null,
  recentTrades: [],
  isLoading: false,
  error: null,
  priceFlash: null,

  loadMarket: async (marketId: string) => {
    set({ isLoading: true, error: null });
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200));
    
    const marketBase = allMarkets.find((m) => m.id === marketId);
    
    if (!marketBase) {
      set({ 
        isLoading: false, 
        error: 'Market not found',
        currentMarket: null,
        orderBook: null,
      });
      return;
    }
    
    const orderBook = generateOrderBook(marketBase.yesPrice);
    
    const market: MarketDetail = {
      id: marketBase.id,
      title: marketBase.title,
      description: marketBase.description,
      category: marketBase.category,
      status: marketBase.status,
      type: marketBase.type,
      volume: marketBase.volume,
      liquidity: marketBase.liquidity,
      yesPrice: marketBase.yesPrice,
      noPrice: marketBase.noPrice,
      createdAt: marketBase.createdAt,
      endsAt: marketBase.endsAt,
      imageUrl: marketBase.imageUrl,
      outcomes: marketBase.outcomes,
      resolvedOutcome: marketBase.resolvedOutcome,
      priceHistory: generatePriceHistory(marketBase.yesPrice),
      orderBook: orderBook,
    };
    
    set({
      currentMarket: market,
      orderBook,
      isLoading: false,
      recentTrades: [],
    });
  },

  updatePrice: (yesPrice: number) => {
    const { currentMarket } = get();
    if (!currentMarket) return;
    
    const oldPrice = currentMarket.yesPrice;
    const flashDirection = yesPrice > oldPrice ? 'up' : yesPrice < oldPrice ? 'down' : null;
    
    set({
      currentMarket: {
        ...currentMarket,
        yesPrice: Math.max(0.01, Math.min(0.99, yesPrice)),
        noPrice: Math.max(0.01, Math.min(0.99, 1 - yesPrice)),
      },
      priceFlash: flashDirection,
    });
    
    // Clear flash after animation
    setTimeout(() => set({ priceFlash: null }), 500);
  },

  addTrade: (trade: Trade) => {
    set((state) => ({
      recentTrades: [trade, ...state.recentTrades].slice(0, 50),
    }));
  },

  subscribeToUpdates: (marketId: string) => {
    const { updatePrice, addTrade, currentMarket } = get();
    
    const unsubPrice = mockSocket.on('PRICE_UPDATE', (data: unknown) => {
      const update = data as { marketId: string; priceChange: number };
      if (update.marketId === marketId && currentMarket) {
        updatePrice(currentMarket.yesPrice + update.priceChange);
      }
    });
    
    const unsubTrade = mockSocket.on('TRADE_EXECUTED', (data: unknown) => {
      const trade = data as Trade & { marketId: string };
      if (trade.marketId === marketId) {
        addTrade({
          id: `t_${Date.now()}`,
          marketId: trade.marketId,
          side: trade.side,
          type: trade.type,
          price: trade.price,
          quantity: trade.quantity,
          timestamp: new Date().toISOString(),
        });
      }
    });
    
    mockSocket.connect();
    
    return () => {
      unsubPrice();
      unsubTrade();
    };
  },
}));
