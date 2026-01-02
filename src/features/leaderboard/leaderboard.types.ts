export interface Trader {
  id: string;
  username: string;
  avatar: string | null;
  totalProfit: number;
  winRate: number;
  totalTrades: number;
  winningTrades: number;
  rank: number;
}
