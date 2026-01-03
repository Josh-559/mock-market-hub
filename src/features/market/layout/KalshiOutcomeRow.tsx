import { ChevronDown, ChevronUp, Trophy } from 'lucide-react';
import type { MarketOutcome } from '@/features/markets/markets.types';
import { cn } from '@/shared/utils';

interface KalshiOutcomeRowProps {
  outcome: MarketOutcome;
  isResolved?: boolean;
  isWinner?: boolean;
  priceChange?: number;
  onTradeYes?: () => void;
  onTradeNo?: () => void;
}

export function KalshiOutcomeRow({ 
  outcome, 
  isResolved, 
  isWinner,
  priceChange = 0,
  onTradeYes,
  onTradeNo,
}: KalshiOutcomeRowProps) {
  const percent = Math.round(outcome.yesPrice * 100);
  const yesPrice = Math.round(outcome.yesPrice * 100);
  const noPrice = Math.round(outcome.noPrice * 100);
  
  return (
    <div className={cn(
      'flex items-center gap-4 px-5 py-4',
      isWinner && 'bg-yes/5'
    )}>
      {/* Avatar/Icon */}
      {outcome.imageUrl ? (
        <img 
          src={outcome.imageUrl} 
          alt={outcome.label}
          className="w-10 h-10 rounded-full object-cover"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-sm font-medium">
          {outcome.label.charAt(0)}
        </div>
      )}

      {/* Name */}
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-foreground truncate block">
          {outcome.label}
        </span>
      </div>

      {/* Chance */}
      <div className="flex items-center gap-2 w-24">
        <span className="text-lg font-bold text-foreground">{percent}%</span>
        {priceChange !== 0 && (
          <span className={cn(
            'flex items-center text-xs font-medium',
            priceChange > 0 ? 'text-yes' : 'text-no'
          )}>
            {priceChange > 0 ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
            {Math.abs(priceChange)}
          </span>
        )}
      </div>

      {/* Trophy for winner */}
      {isWinner && (
        <Trophy className="w-5 h-5 text-yes flex-shrink-0" />
      )}

      {/* Yes/No Buttons */}
      {!isResolved && (
        <div className="flex gap-2 flex-shrink-0">
          <button 
            onClick={onTradeYes}
            className="px-5 py-2 text-sm font-medium rounded-lg bg-yes text-yes-foreground hover:bg-yes/90 transition-colors"
          >
            Yes {yesPrice}¢
          </button>
          <button 
            onClick={onTradeNo}
            className="px-5 py-2 text-sm font-medium rounded-lg border border-no text-no hover:bg-no hover:text-no-foreground transition-colors"
          >
            No {noPrice}¢
          </button>
        </div>
      )}
    </div>
  );
}
