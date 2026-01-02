import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchMarkets } from '@/features/markets/markets.api';
import type { Market, MarketCategory } from '@/features/markets/markets.types';
import { formatVolume, cn } from '@/shared/utils';
import { CATEGORIES, ROUTES } from '@/shared/constants';
import { AppHeader } from '@/components/layout/AppHeader';
import { Loader2, CheckCircle2, TrendingUp, BarChart3, Zap, Trophy } from 'lucide-react';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  all: <BarChart3 className="h-5 w-5" />,
  politics: <TrendingUp className="h-5 w-5" />,
  economics: <BarChart3 className="h-5 w-5" />,
  crypto: <Zap className="h-5 w-5" />,
  sports: <Trophy className="h-5 w-5" />,
  tech: <Zap className="h-5 w-5" />,
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  all: 'Browse all prediction markets',
  politics: 'Elections, legislation, and geopolitical events',
  economics: 'Fed decisions, inflation, and economic indicators',
  crypto: 'Bitcoin, Ethereum, and crypto regulation',
  sports: 'Game outcomes, championships, and player props',
  tech: 'AI developments, startups, and tech regulation',
};

export function CategoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { data: markets, isLoading } = useQuery({
    queryKey: ['markets', selectedCategory],
    queryFn: () => fetchMarkets({
      category: selectedCategory !== 'all' ? selectedCategory as MarketCategory : undefined,
      sortBy: 'volume',
    }),
  });

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      {/* Hero Section */}
      <div className="border-b border-border bg-surface">
        <div className="container py-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Market Categories</h1>
          <p className="text-muted-foreground">Explore prediction markets across different topics</p>
        </div>
      </div>

      {/* Category Cards */}
      <div className="container py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                'p-4 rounded-xl border transition-all text-left',
                selectedCategory === cat.id
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border hover:border-primary/30 hover:bg-surface'
              )}
            >
              <div className={cn(
                'mb-2',
                selectedCategory === cat.id ? 'text-primary' : 'text-muted-foreground'
              )}>
                {CATEGORY_ICONS[cat.id] || <BarChart3 className="h-5 w-5" />}
              </div>
              <h3 className={cn(
                'text-sm font-semibold',
                selectedCategory === cat.id ? 'text-primary' : 'text-foreground'
              )}>
                {cat.label}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {CATEGORY_DESCRIPTIONS[cat.id]}
              </p>
            </button>
          ))}
        </div>

        {/* Selected Category Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            {CATEGORIES.find(c => c.id === selectedCategory)?.label || 'All'} Markets
          </h2>
          <span className="text-sm text-muted-foreground">
            {markets?.length || 0} markets
          </span>
        </div>

        {/* Markets Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : markets && markets.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {markets.map((market) => (
              <CategoryMarketCard key={market.id} market={market} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No markets found in this category</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryMarketCard({ market }: { market: Market }) {
  const yesPercent = Math.round(market.yesPrice * 100);
  const isResolved = market.status === 'resolved';

  return (
    <Link
      to={ROUTES.MARKET(market.id)}
      className="market-card group block"
    >
      <div className="flex flex-col h-full">
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
            <button className="yes-btn-lg">Yes {yesPercent}¢</button>
            <button className="no-btn-lg">No {100 - yesPercent}¢</button>
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
          <span className="text-xs text-muted-foreground">{formatVolume(market.volume)}</span>
          <span className="text-xs text-muted-foreground capitalize">{market.category}</span>
        </div>
      </div>
    </Link>
  );
}
