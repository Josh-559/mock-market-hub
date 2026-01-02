export interface TradeOrder {
  marketId: string;
  side: 'yes' | 'no';
  type: 'buy' | 'sell';
  amount: number;
  price: number;
}

export interface TradeResult {
  success: boolean;
  orderId?: string;
  shares: number;
  totalCost: number;
  avgPrice: number;
  slippage: number;
  error?: string;
}

export interface TradePanelState {
  selectedSide: 'yes' | 'no';
  amount: string;
  isSubmitting: boolean;
  priceLocked: boolean;
  lockedPrice: number | null;
}
