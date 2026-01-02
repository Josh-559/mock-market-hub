import { useState } from 'react';
import { Lock, AlertTriangle } from 'lucide-react';
import { useTradeStore } from '@/features/trading/trade.store';
import { formatCurrency, formatShares } from '@/features/trading/trade.math';
import { QUICK_AMOUNTS } from '@/shared/constants';
import { cn } from '@/shared/utils';
import { toast } from 'sonner';

interface TradePanelProps {
  yesPrice: number;
  noPrice: number;
  liquidity: number;
  priceFlash?: 'up' | 'down' | null;
}

export function TradePanel({ yesPrice, noPrice, liquidity, priceFlash }: TradePanelProps) {
  const {
    selectedSide,
    amount,
    shares,
    payout,
    profit,
    returnPercent,
    estimatedSlippage,
    isSubmitting,
    priceLocked,
    setSelectedSide,
    setAmount,
    setCurrentMarket,
    submitOrder,
  } = useTradeStore();

  // Update store when market prices change
  useState(() => {
    setCurrentMarket(yesPrice, noPrice, liquidity);
  });

  const currentPrice = selectedSide === 'yes' ? yesPrice : noPrice;
  const hasAmount = amount && parseFloat(amount) > 0;

  const handleSubmit = async () => {
    if (!hasAmount) return;
    
    const result = await submitOrder();
    
    if (result.success) {
      toast.success('Order executed!', {
        description: `Bought ${formatShares(result.shares)} ${selectedSide.toUpperCase()} shares at ${(result.avgPrice * 100).toFixed(1)}¢`,
      });
    } else {
      toast.error('Order failed', {
        description: result.error,
      });
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 sticky top-20">
      {/* Side Selection - Kalshi style */}
      <div className="grid grid-cols-2 gap-2 mb-5">
        <button
          onClick={() => setSelectedSide('yes')}
          className={cn(
            'py-3 px-4 rounded-lg text-sm font-medium border-2 transition-all',
            selectedSide === 'yes'
              ? 'yes-btn-lg-active'
              : 'border-border text-muted-foreground hover:border-yes/50 hover:text-yes'
          )}
        >
          <div className="text-center">
            <div className="font-semibold">Yes</div>
            <div className="text-xs mt-0.5 opacity-80">{(yesPrice * 100).toFixed(0)}¢</div>
          </div>
        </button>
        <button
          onClick={() => setSelectedSide('no')}
          className={cn(
            'py-3 px-4 rounded-lg text-sm font-medium border-2 transition-all',
            selectedSide === 'no'
              ? 'no-btn-lg-active'
              : 'border-border text-muted-foreground hover:border-no/50 hover:text-no'
          )}
        >
          <div className="text-center">
            <div className="font-semibold">No</div>
            <div className="text-xs mt-0.5 opacity-80">{(noPrice * 100).toFixed(0)}¢</div>
          </div>
        </button>
      </div>

      {/* Amount Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-foreground mb-2">Amount</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full h-12 pl-8 pr-4 rounded-lg border border-border bg-background text-lg font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        
        {/* Quick amounts */}
        <div className="flex flex-wrap gap-2 mt-3">
          {QUICK_AMOUNTS.map((quickAmount) => (
            <button
              key={quickAmount}
              onClick={() => setAmount(quickAmount.toString())}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors',
                amount === quickAmount.toString()
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:text-foreground hover:bg-surface'
              )}
            >
              ${quickAmount}
            </button>
          ))}
        </div>
      </div>

      {/* Trade Details */}
      {hasAmount && (
        <div className="space-y-2 mb-5 p-4 rounded-lg bg-surface">
          <DetailRow label="Contracts" value={formatShares(shares)} />
          <DetailRow label="Avg price" value={`${(currentPrice * 100).toFixed(1)}¢`} />
          <div className="border-t border-border my-2 pt-2" />
          <DetailRow 
            label="Potential return" 
            value={`${profit >= 0 ? '+' : ''}${formatCurrency(profit)} (${returnPercent >= 0 ? '+' : ''}${returnPercent.toFixed(0)}%)`}
            valueClass={profit >= 0 ? 'text-yes font-medium' : 'text-no font-medium'}
          />
          
          {estimatedSlippage > 0.5 && (
            <div className="flex items-center gap-2 pt-2 text-warning text-xs">
              <AlertTriangle className="h-3 w-3" />
              <span>Est. slippage: {estimatedSlippage.toFixed(1)}%</span>
            </div>
          )}
        </div>
      )}

      {/* Price Lock Indicator */}
      {priceLocked && (
        <div className="flex items-center gap-2 mb-3 text-xs text-primary">
          <Lock className="h-3 w-3" />
          <span>Price locked for execution</span>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!hasAmount || isSubmitting}
        className={cn(
          'w-full py-3 px-4 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed',
          selectedSide === 'yes'
            ? 'bg-yes text-yes-foreground hover:bg-yes/90'
            : 'bg-no text-no-foreground hover:bg-no/90'
        )}
      >
        {isSubmitting ? 'Submitting...' : `Buy ${selectedSide.toUpperCase()}`}
      </button>
      
      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground text-center mt-4">
        This is a demo. No real money involved.
      </p>
    </div>
  );
}

function DetailRow({ 
  label, 
  value, 
  valueClass,
}: { 
  label: string; 
  value: string; 
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn('text-foreground', valueClass)}>
        {value}
      </span>
    </div>
  );
}
