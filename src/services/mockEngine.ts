import Decimal from 'decimal.js';

// Configure Decimal.js for financial precision
Decimal.set({ precision: 20, rounding: Decimal.ROUND_DOWN });

export interface OrderResult {
  success: boolean;
  orderId?: string;
  shares: number;
  totalCost: number;
  avgPrice: number;
  slippage: number;
  error?: string;
}

export interface PriceLevel {
  price: number;
  quantity: number;
}

// Calculate shares purchasable for a given amount at a price
export function calculateShares(amount: number, price: number): number {
  const amountDec = new Decimal(amount);
  const priceDec = new Decimal(price);
  
  if (priceDec.isZero() || priceDec.isNegative()) {
    return 0;
  }
  
  return amountDec.dividedBy(priceDec).floor().toNumber();
}

// Calculate payout if position wins (shares × $1)
export function calculatePayout(shares: number): number {
  return new Decimal(shares).times(1).toNumber();
}

// Calculate profit (payout - cost)
export function calculateProfit(shares: number, cost: number): number {
  return new Decimal(shares).minus(cost).toNumber();
}

// Calculate return percentage
export function calculateReturn(profit: number, cost: number): number {
  if (cost === 0) return 0;
  return new Decimal(profit).dividedBy(cost).times(100).toNumber();
}

// Simulate order execution with slippage
export function simulateOrderExecution(
  side: 'yes' | 'no',
  type: 'buy' | 'sell',
  amount: number,
  currentPrice: number,
  orderbook: { bids: PriceLevel[]; asks: PriceLevel[] }
): OrderResult {
  // Simulate some basic slippage (0.5% - 2% based on order size)
  const slippagePercent = Math.min(0.02, 0.005 + (amount / 100000) * 0.01);
  const slippage = currentPrice * slippagePercent;
  
  const executionPrice = type === 'buy' 
    ? Math.min(0.99, currentPrice + slippage)
    : Math.max(0.01, currentPrice - slippage);
  
  const shares = calculateShares(amount, executionPrice);
  const totalCost = new Decimal(shares).times(executionPrice).toNumber();
  
  if (shares === 0) {
    return {
      success: false,
      shares: 0,
      totalCost: 0,
      avgPrice: 0,
      slippage: 0,
      error: 'Order too small',
    };
  }
  
  return {
    success: true,
    orderId: `ord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    shares,
    totalCost,
    avgPrice: executionPrice,
    slippage: slippagePercent * 100,
  };
}

// Format price as percentage
export function formatPrice(price: number): string {
  return `${(price * 100).toFixed(1)}¢`;
}

// Format price as probability
export function formatProbability(price: number): string {
  return `${(price * 100).toFixed(0)}%`;
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Format large numbers with K/M suffixes
export function formatVolume(volume: number): string {
  if (volume >= 1_000_000) {
    return `$${(volume / 1_000_000).toFixed(1)}M`;
  }
  if (volume >= 1_000) {
    return `$${(volume / 1_000).toFixed(0)}K`;
  }
  return `$${volume}`;
}
