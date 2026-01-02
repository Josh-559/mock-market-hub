import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchMarkets } from './markets.api';
import type { Market, MarketCategory } from './markets.types';
import { PriceCard, CategoryBadge } from '@/shared/ui';
import { formatVolume, formatTimeRemaining, cn } from '@/shared/utils';
import { CATEGORIES, ROUTES } from '@/shared/constants';
import { useState } from 'react';
import { Search, TrendingUp, Clock, Loader2 } from 'lucide-react';

export function MarketList() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: markets, isLoading } = useQuery({
    queryKey: ['markets', selectedCategory, searchQuery],
    queryFn: () => fetchMarkets({
      category: selectedCategory !== 'all' ? selectedCategory as MarketCategory : undefined,
      search: searchQuery || undefined,
      sortBy: 'volume',
    }),
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container py-4">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">Predictex</span>
            </Link>
            
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search markets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-lg bg-surface border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            
            {/* Balance (mock) */}
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-surface border border-border">
              <span className="text-muted-foreground text-sm">Balance</span>
              <span className="font-semibold text-foreground">$10,000.00</span>
            </div>
          </div>
        </div>
      </header>

      {/* Categories */}
      <div className="border-b border-border bg-surface/50">
        <div className="container">
          <div className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                  selectedCategory === cat.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-surface-hover'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Markets Grid */}
      <main className="container py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : markets && markets.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {markets.map((market) => (
              <MarketCard key={market.id} market={market} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No markets found</p>
          </div>
        )}
      </main>
    </div>
  );
}

function MarketCard({ market }: { market: Market }) {
  return (
    <Link
      to={ROUTES.MARKET(market.id)}
      className="market-card group block"
    >
      <div className="flex flex-col h-full">
        {/* Category & Time */}
        <div className="flex items-center justify-between mb-3">
          <CategoryBadge category={market.category} />
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{formatTimeRemaining(market.endsAt)}</span>
          </div>
        </div>
        
        {/* Title */}
        <h3 className="text-base font-semibold text-foreground mb-4 line-clamp-2 group-hover:text-primary transition-colors">
          {market.title}
        </h3>
        
        {/* Prices */}
        <div className="flex gap-2 mt-auto">
          <PriceCard side="yes" price={market.yesPrice} size="sm" />
          <PriceCard side="no" price={market.noPrice} size="sm" />
        </div>
        
        {/* Volume */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <span className="text-xs text-muted-foreground">Volume</span>
          <span className="text-xs font-medium text-foreground">{formatVolume(market.volume)}</span>
        </div>
      </div>
    </Link>
  );
}
