import { create } from 'zustand';
import type { TradePanelState, TradeResult } from './trade.types';
import { calculateShares, calculatePayout, calculateProfit, calculateReturn, calculateEstimatedSlippage } from './trade.math';

interface TradeStore extends TradePanelState {
  // Computed values
  shares: number;
  payout: number;
  profit: number;
  returnPercent: number;
  estimatedSlippage: number;
  
  // Current market context
  currentPrice: number;
  currentLiquidity: number;
  
  // Actions
  setSelectedSide: (side: 'yes' | 'no') => void;
  setAmount: (amount: string) => void;
  setCurrentMarket: (yesPrice: number, noPrice: number, liquidity: number) => void;
  lockPrice: () => void;
  unlockPrice: () => void;
  submitOrder: () => Promise<TradeResult>;
  reset: () => void;
}

const PRICE_LOCK_DURATION = 3000; // 3 seconds

export const useTradeStore = create<TradeStore>((set, get) => ({
  selectedSide: 'yes',
  amount: '',
  isSubmitting: false,
  priceLocked: false,
  lockedPrice: null,
  
  shares: 0,
  payout: 0,
  profit: 0,
  returnPercent: 0,
  estimatedSlippage: 0,
  
  currentPrice: 0,
  currentLiquidity: 0,

  setSelectedSide: (side) => {
    set({ selectedSide: side });
    // Recalculate with new side
    const state = get();
    const amountNum = parseFloat(state.amount) || 0;
    const price = side === 'yes' ? state.currentPrice : 1 - state.currentPrice;
    const shares = calculateShares(amountNum, price);
    const payout = calculatePayout(shares);
    const profit = calculateProfit(shares, amountNum);
    const returnPercent = calculateReturn(profit, amountNum);
    
    set({ shares, payout, profit, returnPercent });
  },

  setAmount: (amount) => {
    const amountNum = parseFloat(amount) || 0;
    const state = get();
    const price = state.selectedSide === 'yes' ? state.currentPrice : 1 - state.currentPrice;
    const shares = calculateShares(amountNum, price);
    const payout = calculatePayout(shares);
    const profit = calculateProfit(shares, amountNum);
    const returnPercent = calculateReturn(profit, amountNum);
    const estimatedSlippage = calculateEstimatedSlippage(amountNum, state.currentLiquidity);
    
    set({ amount, shares, payout, profit, returnPercent, estimatedSlippage });
  },

  setCurrentMarket: (yesPrice, noPrice, liquidity) => {
    set({ currentPrice: yesPrice, currentLiquidity: liquidity });
    // Recalculate if there's an amount
    const state = get();
    if (state.amount) {
      const amountNum = parseFloat(state.amount) || 0;
      const price = state.selectedSide === 'yes' ? yesPrice : noPrice;
      const shares = calculateShares(amountNum, price);
      const payout = calculatePayout(shares);
      const profit = calculateProfit(shares, amountNum);
      const returnPercent = calculateReturn(profit, amountNum);
      const estimatedSlippage = calculateEstimatedSlippage(amountNum, liquidity);
      
      set({ shares, payout, profit, returnPercent, estimatedSlippage });
    }
  },

  lockPrice: () => {
    const state = get();
    const price = state.selectedSide === 'yes' ? state.currentPrice : 1 - state.currentPrice;
    set({ priceLocked: true, lockedPrice: price });
    
    // Auto-unlock after duration
    setTimeout(() => {
      set({ priceLocked: false, lockedPrice: null });
    }, PRICE_LOCK_DURATION);
  },

  unlockPrice: () => {
    set({ priceLocked: false, lockedPrice: null });
  },

  submitOrder: async () => {
    const state = get();
    
    if (!state.amount || parseFloat(state.amount) <= 0) {
      return { success: false, shares: 0, totalCost: 0, avgPrice: 0, slippage: 0, error: 'Invalid amount' };
    }
    
    set({ isSubmitting: true });
    
    // Lock price before submission
    if (!state.priceLocked) {
      get().lockPrice();
    }
    
    // Simulate order execution delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    const amountNum = parseFloat(state.amount);
    const price = state.lockedPrice || (state.selectedSide === 'yes' ? state.currentPrice : 1 - state.currentPrice);
    const slippagePercent = state.estimatedSlippage;
    const executionPrice = price * (1 + slippagePercent / 100);
    const shares = calculateShares(amountNum, executionPrice);
    
    const result: TradeResult = {
      success: true,
      orderId: `ord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      shares,
      totalCost: amountNum,
      avgPrice: executionPrice,
      slippage: slippagePercent,
    };
    
    set({ isSubmitting: false });
    get().reset();
    
    return result;
  },

  reset: () => {
    set({
      amount: '',
      shares: 0,
      payout: 0,
      profit: 0,
      returnPercent: 0,
      estimatedSlippage: 0,
      priceLocked: false,
      lockedPrice: null,
    });
  },
}));
