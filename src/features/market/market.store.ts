import { create } from 'zustand';
import type { MarketDetail, OrderBook, Trade } from './market.types';
import { mockMarketDetails, generatePriceHistory, mockOrderBooks } from './market.mock';
import { mockSocket } from '@/services/mockSocket';

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
    
    const marketBase = mockMarketDetails[marketId];
    
    if (!marketBase) {
      set({ 
        isLoading: false, 
        error: 'Market not found',
        currentMarket: null,
        orderBook: null,
      });
      return;
    }
    
    const market: MarketDetail = {
      ...marketBase,
      priceHistory: generatePriceHistory(marketBase.yesPrice),
    };
    
    const orderBook = mockOrderBooks[marketId] || {
      bids: [],
      asks: [],
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
