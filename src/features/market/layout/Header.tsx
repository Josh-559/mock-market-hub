import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, TrendingUp, Users } from 'lucide-react';
import { CategoryBadge } from '@/shared/ui';
import { formatVolume, formatTimeRemaining } from '@/shared/utils';
import type { MarketDetail } from '../market.types';

interface MarketHeaderProps {
  market: MarketDetail;
}

export function MarketHeader({ market }: MarketHeaderProps) {
  return (
    <div className="border-b border-border bg-surface/50">
      <div className="container py-4">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          All Markets
        </Link>
        
        {/* Market info */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CategoryBadge category={market.category} />
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Ends in {formatTimeRemaining(market.endsAt)}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">{market.title}</h1>
            <p className="text-sm text-muted-foreground max-w-2xl">{market.description}</p>
          </div>
          
          {/* Stats */}
          <div className="flex flex-wrap gap-4 lg:gap-6">
            <Stat icon={TrendingUp} label="Volume" value={formatVolume(market.volume)} />
            <Stat icon={Users} label="Liquidity" value={formatVolume(market.liquidity)} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof TrendingUp; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-8 w-8 rounded-lg bg-surface-elevated flex items-center justify-center">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}
