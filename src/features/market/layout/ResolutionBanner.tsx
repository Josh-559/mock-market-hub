import { CheckCircle2, XCircle, Clock, TrendingUp, Coins } from 'lucide-react';
import { cn } from '@/shared/utils';
import type { MarketDetail } from '../market.types';
import dayjs from 'dayjs';

interface ResolutionBannerProps {
  market: MarketDetail;
  userPosition?: {
    side: 'yes' | 'no';
    shares: number;
    avgPrice: number;
  } | null;
}

export function ResolutionBanner({ market, userPosition }: ResolutionBannerProps) {
  const isResolved = market.status === 'resolved';
  const isPending = market.status === 'pending';
  
  if (!isResolved && !isPending) return null;

  const resolvedToYes = market.resolvedOutcome === 'yes';
  const userWon = userPosition && (
    (resolvedToYes && userPosition.side === 'yes') ||
    (!resolvedToYes && userPosition.side === 'no')
  );

  // Calculate payout if user has position
  const calculatePayout = () => {
    if (!userPosition) return null;
    
    const cost = userPosition.shares * userPosition.avgPrice;
    
    if (isResolved) {
      if (userWon) {
        // Winning position pays out $1 per share
        const payout = userPosition.shares;
        const profit = payout - cost;
        return { payout, profit, cost };
      } else {
        // Losing position is worth $0
        return { payout: 0, profit: -cost, cost };
      }
    }
    
    return null;
  };

  const payoutInfo = calculatePayout();

  if (isPending) {
    return (
      <div className="rounded-xl border border-warning/30 bg-warning/5 p-5">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
            <Clock className="h-5 w-5 text-warning" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-foreground mb-1">
              Market Pending Resolution
            </h3>
            <p className="text-sm text-muted-foreground">
              This market has ended and is awaiting resolution. The outcome will be announced soon.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Market ended: {dayjs(market.endsAt).format('MMM D, YYYY [at] h:mm A')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'rounded-xl border p-5',
      resolvedToYes 
        ? 'border-yes/30 bg-yes/5' 
        : 'border-no/30 bg-no/5'
    )}>
      <div className="flex items-start gap-4">
        {/* Resolution Icon */}
        <div className={cn(
          'h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0',
          resolvedToYes ? 'bg-yes/10' : 'bg-no/10'
        )}>
          {resolvedToYes ? (
            <CheckCircle2 className="h-5 w-5 text-yes" />
          ) : (
            <XCircle className="h-5 w-5 text-no" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-semibold text-foreground">
              Resolved: {resolvedToYes ? 'YES' : 'NO'}
            </h3>
            <span className={cn(
              'px-2 py-0.5 rounded-full text-xs font-medium',
              resolvedToYes 
                ? 'bg-yes text-yes-foreground' 
                : 'bg-no text-no-foreground'
            )}>
              Final
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            This market has been resolved. {resolvedToYes ? 'YES' : 'NO'} positions paid out $1.00 per share.
          </p>

          {/* User Position Outcome */}
          {userPosition && payoutInfo && (
            <div className={cn(
              'mt-4 p-4 rounded-lg',
              userWon ? 'bg-yes/10' : 'bg-no/10'
            )}>
              <div className="flex items-center gap-2 mb-3">
                {userWon ? (
                  <TrendingUp className="h-4 w-4 text-yes" />
                ) : (
                  <Coins className="h-4 w-4 text-no" />
                )}
                <span className={cn(
                  'text-sm font-semibold',
                  userWon ? 'text-yes' : 'text-no'
                )}>
                  {userWon ? 'You Won!' : 'Position Expired'}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-0.5">Your Position</p>
                  <p className="font-medium text-foreground">
                    {userPosition.shares} {userPosition.side.toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-0.5">Cost Basis</p>
                  <p className="font-medium text-foreground">
                    ${payoutInfo.cost.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-0.5">
                    {userWon ? 'Payout' : 'Loss'}
                  </p>
                  <p className={cn(
                    'font-semibold',
                    userWon ? 'text-yes' : 'text-no'
                  )}>
                    {userWon ? '+' : ''}{payoutInfo.profit >= 0 ? '+' : ''}${payoutInfo.profit.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-3">
            Resolved: {dayjs(market.resolutionDate || market.endsAt).format('MMM D, YYYY [at] h:mm A')}
          </p>
        </div>
      </div>
    </div>
  );
}
