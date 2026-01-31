import { create } from "zustand";
import userMock from "@/mocks/user.json";

export interface Position {
  marketId: string;
  marketTitle: string;
  side: "yes" | "no";
  shares: number;
  avgPrice: number;
  currentPrice: number;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
}

export interface TradeHistoryItem {
  id: string;
  marketId: string;
  marketTitle: string;
  side: "yes" | "no";
  type: "buy" | "sell";
  price: number;
  quantity: number;
  total: number;
  timestamp: string;
}

interface PortfolioState {
  positions: Position[];
  tradeHistory: TradeHistoryItem[];
  totalValue: number;
  totalPnl: number;
  totalPnlPercent: number;
  isLoading: boolean;
  loadPortfolio: () => void;
}

// Market titles mapping
const marketTitles: Record<string, string> = {
  "btc-100k-2026": "Will Bitcoin reach ₦100k in 2026?",
  "fed-rate-cut-q1": "Fed rate cut in Q1 2026?",
  "trump-2028": "Trump wins 2028 election?",
};

export const usePortfolioStore = create<PortfolioState>((set) => ({
  positions: [],
  tradeHistory: [],
  totalValue: 0,
  totalPnl: 0,
  totalPnlPercent: 0,
  isLoading: false,

  loadPortfolio: () => {
    set({ isLoading: true });

    // Simulate loading delay
    setTimeout(() => {
      // Transform mock positions with calculated P&L
      const positions: Position[] = userMock.positions.map((pos) => {
        // Simulate current price (slightly different from avg)
        const currentPrice = pos.avgPrice + (Math.random() - 0.5) * 0.1;
        const currentValue = pos.shares * currentPrice;
        const cost = pos.shares * pos.avgPrice;
        const pnl = currentValue - cost;
        const pnlPercent = (pnl / cost) * 100;

        return {
          marketId: pos.marketId,
          marketTitle: marketTitles[pos.marketId] || pos.marketId,
          side: pos.side as "yes" | "no",
          shares: pos.shares,
          avgPrice: pos.avgPrice,
          currentPrice,
          currentValue,
          pnl,
          pnlPercent,
        };
      });

      // Transform trade history
      const tradeHistory: TradeHistoryItem[] = userMock.tradeHistory.map(
        (trade) => ({
          id: trade.id,
          marketId: trade.marketId,
          marketTitle: marketTitles[trade.marketId] || trade.marketId,
          side: trade.side as "yes" | "no",
          type: trade.type as "buy" | "sell",
          price: trade.price,
          quantity: trade.quantity,
          total: trade.total,
          timestamp: trade.timestamp,
        }),
      );

      // Calculate totals
      const totalValue = positions.reduce(
        (sum, pos) => sum + pos.currentValue,
        0,
      );
      const totalCost = positions.reduce(
        (sum, pos) => sum + pos.shares * pos.avgPrice,
        0,
      );
      const totalPnl = totalValue - totalCost;
      const totalPnlPercent = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

      set({
        positions,
        tradeHistory,
        totalValue,
        totalPnl,
        totalPnlPercent,
        isLoading: false,
      });
    }, 500);
  },
}));
