import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchMarkets } from './markets.api';
import type { Market, MarketCategory } from './markets.types';
import { formatVolume, cn } from '@/shared/utils';
import { CATEGORIES, ROUTES } from '@/shared/constants';
import { useState } from 'react';
import { Loader2, Plus, CheckCircle2 } from 'lucide-react';
import { AppHeader } from '@/components/layout/AppHeader';

// Subcategory pills for each main category
const SUBCATEGORIES: Record<string, string[]> = {
  all: [],
  politics: ['Trump Agenda', 'Culture war', 'SCOTUS & courts', 'US Elections', 'Bills', 'Foreign Elections', 'Education', 'Debt ceiling & shutdowns', 'Immigration'],
  economics: ['Fed', 'Inflation', 'GDP', 'Jobs', 'Housing'],
  crypto: ['Bitcoin', 'Ethereum', 'Altcoins', 'Regulation'],
  sports: ['NFL', 'NBA', 'Soccer', 'Tennis'],
  tech: ['AI', 'Startups', 'Big Tech', 'Regulation'],
};

export function MarketList() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  
  const { data: markets, isLoading } = useQuery({
    queryKey: ['markets', selectedCategory],
    queryFn: () => fetchMarkets({
      category: selectedCategory !== 'all' ? selectedCategory as MarketCategory : undefined,
      sortBy: 'volume',
    }),
  });

  const subcategories = SUBCATEGORIES[selectedCategory] || [];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      {/* Categories - Main */}
      <div className="border-b border-border">
        <div className="container">
          <div className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setSelectedSubcategory(null);
                }}
                className={cn(
                  'px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors rounded-lg',
                  selectedCategory === cat.id
                    ? 'text-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Subcategories Pills */}
      {subcategories.length > 0 && (
        <div className="border-b border-border bg-background">
          <div className="container">
            <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-none">
              <button
                onClick={() => setSelectedSubcategory(null)}
                className={cn(
                  'category-pill',
                  !selectedSubcategory && 'category-pill-active'
                )}
              >
                All
              </button>
              {subcategories.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubcategory(sub)}
                  className={cn(
                    'category-pill',
                    selectedSubcategory === sub && 'category-pill-active'
                  )}
                >
                  {sub}
                </button>
              ))}
              <button className="category-pill flex items-center gap-1">
                Sort / Filter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Markets Grid */}
      <main className="container py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : markets && markets.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
  const yesPercent = Math.round(market.yesPrice * 100);
  const isResolved = market.status === 'resolved';

  return (
    <Link
      to={ROUTES.MARKET(market.id)}
      className="market-card group block"
    >
      <div className="flex flex-col h-full">
        {/* Market Icon & Title */}
        <div className="flex gap-3 mb-4">
          {market.imageUrl ? (
            <img
              src={market.imageUrl}
              alt=""
              className="h-10 w-10 rounded-lg object-cover flex-shrink-0"
            />
          ) : (
            <div className="h-10 w-10 rounded-lg bg-surface flex-shrink-0 flex items-center justify-center">
              <span className="text-lg">{market.title.charAt(0)}</span>
            </div>
          )}
          <h3 className="text-sm font-medium text-foreground line-clamp-2 flex-1">
            {market.title}
          </h3>
          {/* Probability badge */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {isResolved && (
              <CheckCircle2 className={cn(
                'h-4 w-4',
                market.resolvedOutcome === 'yes' ? 'text-yes' : 'text-no'
              )} />
            )}
            <span className="text-sm font-semibold text-foreground">
              {yesPercent}%
            </span>
          </div>
        </div>

        {/* Yes/No Buttons or Resolution Status */}
        {isResolved ? (
          <div className={cn(
            'flex items-center justify-center py-3 px-4 rounded-lg',
            market.resolvedOutcome === 'yes' ? 'bg-yes/10 text-yes' : 'bg-no/10 text-no'
          )}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">
              Resolved {market.resolvedOutcome?.toUpperCase()}
            </span>
          </div>
        ) : (
          <div className="flex gap-2 mt-auto">
            <button className="yes-btn-lg flex flex-col items-center">
              <span>Yes</span>
              <span className="text-xs mt-0.5 opacity-80">
                ${(100 * market.yesPrice).toFixed(0)} → ${(100).toFixed(0)}
              </span>
            </button>
            <button className="no-btn-lg flex flex-col items-center">
              <span>No</span>
              <span className="text-xs mt-0.5 opacity-80">
                ${(100 * market.noPrice).toFixed(0)} → ${(100).toFixed(0)}
              </span>
            </button>
          </div>
        )}

        {/* Volume */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
          <span className="text-xs text-muted-foreground">{formatVolume(market.volume)}</span>
          <button 
            className="h-6 w-6 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
            onClick={(e) => e.preventDefault()}
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>
    </Link>
  );
}
