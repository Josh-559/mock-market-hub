import { useState, useMemo } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/shared/utils';
import { notificationService } from '@/services/notificationService';
import type { Market, MarketOutcome } from './markets.types';

interface QuickTradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  market: Market;
  initialSide: 'yes' | 'no';
  outcome?: MarketOutcome; // For multi-outcome markets
}

const QUICK_AMOUNTS = [1, 20, 100];

export function QuickTradeModal({ 
  open, 
  onOpenChange, 
  market, 
  initialSide,
  outcome 
}: QuickTradeModalProps) {
  const [selectedSide, setSelectedSide] = useState<'yes' | 'no'>(initialSide);
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentPrice = outcome 
    ? (selectedSide === 'yes' ? outcome.yesPrice : outcome.noPrice)
    : (selectedSide === 'yes' ? market.yesPrice : market.noPrice);
  
  const hasAmount = amount && parseFloat(amount) > 0;

  // Calculate shares and potential return
  const { shares, potentialReturn, returnPercent } = useMemo(() => {
    if (!hasAmount) return { shares: 0, potentialReturn: 0, returnPercent: 0 };
    const amountNum = parseFloat(amount);
    const sharesCalc = Math.floor(amountNum / currentPrice);
    const payout = sharesCalc * 1; // $1 per share if wins
    const profit = payout - amountNum;
    const percent = (profit / amountNum) * 100;
    return { shares: sharesCalc, potentialReturn: profit, returnPercent: percent };
  }, [amount, currentPrice, hasAmount]);

  const handleSubmit = async () => {
    if (!hasAmount) return;
    
    setIsSubmitting(true);
    
    // Simulate order execution
    await new Promise(resolve => setTimeout(resolve, 800));
    
    notificationService.notifyTradeExecuted(selectedSide, shares, currentPrice);
    
    setIsSubmitting(false);
    onOpenChange(false);
    setAmount('');
  };

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
  };

  const displayTitle = outcome ? outcome.label : market.title;
  const displayImage = outcome?.imageUrl || market.imageUrl;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            {displayImage ? (
              <img 
                src={displayImage} 
                alt="" 
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center">
                <span className="font-bold text-sm">{displayTitle.charAt(0)}</span>
              </div>
            )}
            <DialogTitle className="text-base font-semibold text-foreground line-clamp-2">
              {displayTitle}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="p-4 space-y-4">
          {/* Buy label */}
          <div className="text-sm text-muted-foreground font-medium">Buy</div>

          {/* Side Selection - Yes/No */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setSelectedSide('yes')}
              className={cn(
                'py-3 rounded-lg text-sm font-semibold transition-all',
                selectedSide === 'yes'
                  ? 'bg-yes text-yes-foreground'
                  : 'bg-yes/10 text-yes hover:bg-yes/20'
              )}
            >
              Yes {((outcome?.yesPrice || market.yesPrice) * 100).toFixed(0)}¢
            </button>
            <button
              onClick={() => setSelectedSide('no')}
              className={cn(
                'py-3 rounded-lg text-sm font-semibold transition-all',
                selectedSide === 'no'
                  ? 'bg-no text-no-foreground'
                  : 'bg-no/10 text-no hover:bg-no/20'
              )}
            >
              No {((outcome?.noPrice || market.noPrice) * 100).toFixed(0)}¢
            </button>
          </div>

          {/* Amount */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Amount</span>
              <span className="text-2xl font-bold text-muted-foreground">
                ${amount || '0'}
              </span>
            </div>
            
            {/* Quick amounts */}
            <div className="flex items-center gap-2">
              {QUICK_AMOUNTS.map((quickAmount) => (
                <button
                  key={quickAmount}
                  onClick={() => handleQuickAmount(quickAmount)}
                  className={cn(
                    'px-4 py-2 text-sm font-medium rounded-lg border transition-colors flex-1',
                    amount === quickAmount.toString()
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:text-foreground hover:bg-surface'
                  )}
                >
                  +${quickAmount}
                </button>
              ))}
              <button
                onClick={() => setAmount('1000')}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-surface"
              >
                Max
              </button>
            </div>
          </div>

          {/* Trade Details */}
          {hasAmount && (
            <div className="space-y-2 p-3 rounded-lg bg-surface text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Shares</span>
                <span className="text-foreground font-medium">{shares.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Avg price</span>
                <span className="text-foreground">{(currentPrice * 100).toFixed(1)}¢</span>
              </div>
              <div className="border-t border-border my-2 pt-2" />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Potential return</span>
                <span className={cn(
                  'font-medium',
                  potentialReturn >= 0 ? 'text-yes' : 'text-no'
                )}>
                  {potentialReturn >= 0 ? '+' : ''}${potentialReturn.toFixed(2)} ({returnPercent >= 0 ? '+' : ''}{returnPercent.toFixed(0)}%)
                </span>
              </div>
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
            {isSubmitting ? 'Submitting...' : 'Trade'}
          </button>

          {/* Terms */}
          <p className="text-xs text-muted-foreground text-center">
            By trading, you agree to the <span className="underline cursor-pointer">Terms of Use</span>.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
