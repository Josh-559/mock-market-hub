import { useState } from 'react';
import { Lock, Unlock, AlertTriangle } from 'lucide-react';
import { PriceCard, TradeButton } from '@/shared/ui';
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
    lockPrice,
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
    <div className="rounded-xl border border-border bg-card p-4 lg:p-5">
      <h3 className="text-lg font-semibold text-foreground mb-4">Trade</h3>
      
      {/* Side Selection */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <PriceCard
          side="yes"
          price={yesPrice}
          isSelected={selectedSide === 'yes'}
          onClick={() => setSelectedSide('yes')}
          size="md"
          flash={priceFlash}
        />
        <PriceCard
          side="no"
          price={noPrice}
          isSelected={selectedSide === 'no'}
          onClick={() => setSelectedSide('no')}
          size="md"
          flash={priceFlash === 'up' ? 'down' : priceFlash === 'down' ? 'up' : null}
        />
      </div>

      {/* Amount Input */}
      <div className="mb-4">
        <label className="block text-sm text-muted-foreground mb-2">Amount</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="trade-input w-full pl-7 pr-4 rounded-lg border bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
        
        {/* Quick amounts */}
        <div className="flex flex-wrap gap-2 mt-2">
          {QUICK_AMOUNTS.map((quickAmount) => (
            <button
              key={quickAmount}
              onClick={() => setAmount(quickAmount.toString())}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                amount === quickAmount.toString()
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-surface-elevated text-muted-foreground hover:text-foreground'
              )}
            >
              ${quickAmount}
            </button>
          ))}
        </div>
      </div>

      {/* Trade Details */}
      {hasAmount && (
        <div className="space-y-2 mb-5 p-3 rounded-lg bg-surface-elevated">
          <DetailRow label="Shares" value={formatShares(shares)} />
          <DetailRow label="Avg Price" value={`${(currentPrice * 100).toFixed(1)}¢`} />
          <DetailRow label="Est. Payout" value={formatCurrency(payout)} highlight />
          <DetailRow 
            label="Est. Profit" 
            value={`${profit >= 0 ? '+' : ''}${formatCurrency(profit)}`} 
            valueClass={profit >= 0 ? 'text-yes' : 'text-no'}
          />
          <DetailRow 
            label="Return" 
            value={`${returnPercent >= 0 ? '+' : ''}${returnPercent.toFixed(0)}%`}
            valueClass={returnPercent >= 0 ? 'text-yes' : 'text-no'}
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
      <TradeButton
        side={selectedSide}
        onClick={handleSubmit}
        disabled={!hasAmount}
        loading={isSubmitting}
      >
        Buy {selectedSide.toUpperCase()}
      </TradeButton>
      
      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground text-center mt-3">
        This is a demo. No real money involved.
      </p>
    </div>
  );
}

function DetailRow({ 
  label, 
  value, 
  highlight = false,
  valueClass,
}: { 
  label: string; 
  value: string; 
  highlight?: boolean;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn(
        highlight ? 'font-semibold text-foreground' : 'text-foreground',
        valueClass
      )}>
        {value}
      </span>
    </div>
  );
}
