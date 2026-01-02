import Decimal from 'decimal.js';

Decimal.set({ precision: 20, rounding: Decimal.ROUND_DOWN });

export function calculateShares(amount: number, price: number): number {
  if (price <= 0 || price >= 1) return 0;
  return new Decimal(amount).dividedBy(price).floor().toNumber();
}

export function calculatePayout(shares: number): number {
  return new Decimal(shares).times(1).toNumber();
}

export function calculateProfit(shares: number, cost: number): number {
  return new Decimal(shares).minus(cost).toNumber();
}

export function calculateReturn(profit: number, cost: number): number {
  if (cost === 0) return 0;
  return new Decimal(profit).dividedBy(cost).times(100).toNumber();
}

export function calculateEstimatedSlippage(amount: number, liquidity: number): number {
  // Simple slippage model: higher amount relative to liquidity = more slippage
  const impactRatio = amount / liquidity;
  return Math.min(5, impactRatio * 100); // Cap at 5%
}

export function formatPrice(price: number): string {
  return `${(price * 100).toFixed(1)}¢`;
}

export function formatProbability(price: number): string {
  return `${(price * 100).toFixed(0)}%`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatShares(shares: number): string {
  return shares.toLocaleString('en-US');
}
