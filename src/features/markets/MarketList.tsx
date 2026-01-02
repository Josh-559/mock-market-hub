import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchMarkets } from './markets.api';
import type { Market, MarketCategory } from './markets.types';
import { formatVolume, cn } from '@/shared/utils';
import { CATEGORIES, ROUTES } from '@/shared/constants';
import { useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
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
  const isResolved = market.status === 'resolved';
  const isMultiOutcome = market.outcomes && market.outcomes.length > 0;

  // Calculate potential return (buy at current price, win $1)
  const calcReturn = (price: number) => {
    const cost = 100; // $100 investment
    const shares = cost / price;
    const payout = shares * 1; // $1 per share if wins
    return Math.round(payout);
  };

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
              className="h-12 w-12 rounded-lg object-cover flex-shrink-0"
            />
          ) : (
            <div className="h-12 w-12 rounded-lg bg-surface flex-shrink-0 flex items-center justify-center">
              <span className="text-lg font-medium">{market.title.charAt(0)}</span>
            </div>
          )}
          <h3 className="text-sm font-medium text-foreground line-clamp-2 flex-1 leading-snug">
            {market.title}
          </h3>
        </div>

        {/* Outcomes List */}
        <div className="space-y-2 flex-1">
          {isMultiOutcome ? (
            // Multi-outcome: show top 2 outcomes
            market.outcomes!.slice(0, 2).map((outcome) => {
              const percent = Math.round(outcome.yesPrice * 100);
              return (
                <div key={outcome.id} className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground truncate flex-1">
                    {outcome.label}
                  </span>
                  <span className="text-sm font-semibold text-foreground w-12 text-right">
                    {percent}%
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => e.preventDefault()}
                      className="px-2.5 py-1 text-xs font-medium rounded bg-yes/10 text-yes hover:bg-yes/20 transition-colors"
                    >
                      Yes
                    </button>
                    <button
                      onClick={(e) => e.preventDefault()}
                      className="px-2.5 py-1 text-xs font-medium rounded bg-no/10 text-no hover:bg-no/20 transition-colors"
                    >
                      No
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            // Binary outcome: single row with percent and buttons
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={(e) => e.preventDefault()}
                    className="px-4 py-2 text-sm font-medium rounded-lg bg-yes/10 text-yes hover:bg-yes/20 transition-colors"
                  >
                    Yes
                  </button>
                  <button
                    onClick={(e) => e.preventDefault()}
                    className="px-4 py-2 text-sm font-medium rounded-lg bg-no/10 text-no hover:bg-no/20 transition-colors"
                  >
                    No
                  </button>
                </div>
                <span className="text-lg font-bold text-foreground">
                  {Math.round(market.yesPrice * 100)}%
                </span>
              </div>
              {/* Return calculation */}
              <div className="flex gap-6 text-xs">
                <div className="text-muted-foreground">
                  $100 → <span className="text-yes font-medium">${calcReturn(market.yesPrice)}</span>
                </div>
                <div className="text-muted-foreground">
                  $100 → <span className="text-no font-medium">${calcReturn(market.noPrice)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Volume & Add Button */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
          <span className="text-sm text-muted-foreground font-medium">
            ${formatVolume(market.volume).replace('$', '')}
          </span>
          <button 
            className="h-7 w-7 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
            onClick={(e) => e.preventDefault()}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}
