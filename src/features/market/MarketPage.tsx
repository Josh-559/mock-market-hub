import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, ArrowLeft, Share2, Plus, Check, Download, RefreshCw, SlidersHorizontal } from 'lucide-react';
import { useMarketStore } from './market.store';
import { KalshiChart } from './layout/KalshiChart';
import { PolymarketTradePanel } from './layout/PolymarketTradePanel';
import { KalshiOutcomeRow } from './layout/KalshiOutcomeRow';
import { RulesSummary } from './layout/RulesSummary';
import { CommentsSection } from './layout/CommentsSection';
import { ResolutionBanner } from './layout/ResolutionBanner';
import { OrderBook } from './layout/OrderBook';
import { OutcomeOrderBook, generateMockOrderBook } from './layout/OutcomeOrderBook';
import { AppHeader } from '@/components/layout/AppHeader';
import { useWatchlistStore } from '@/features/watchlist/watchlist.store';
import { cn } from '@/shared/utils';
import type { MarketOutcome } from '@/features/markets/markets.types';
import type { OrderBook as OrderBookType } from './market.types';

// Import market images
import politicsImg from '@/assets/markets/politics.jpg';
import cryptoImg from '@/assets/markets/crypto.jpg';
import economicsImg from '@/assets/markets/economics.jpg';
import sportsImg from '@/assets/markets/sports.jpg';
import techImg from '@/assets/markets/tech.jpg';
import ukraineImg from '@/assets/markets/ukraine.jpg';

// Map categories/markets to images
const MARKET_IMAGES: Record<string, string> = {
  politics: politicsImg,
  crypto: cryptoImg,
  economics: economicsImg,
  sports: sportsImg,
  tech: techImg,
  ukraine: ukraineImg,
};

function getMarketImage(market: { id: string; category: string; title: string }): string | undefined {
  // Check if market title contains key words
  const titleLower = market.title.toLowerCase();
  if (titleLower.includes('ukraine') || titleLower.includes('ceasefire')) return ukraineImg;
  if (titleLower.includes('bitcoin') || titleLower.includes('crypto')) return cryptoImg;
  if (titleLower.includes('fed') || titleLower.includes('rate') || titleLower.includes('inflation')) return economicsImg;
  if (titleLower.includes('trump') || titleLower.includes('election') || titleLower.includes('president')) return politicsImg;
  if (titleLower.includes('nfl') || titleLower.includes('nba') || titleLower.includes('sports')) return sportsImg;
  if (titleLower.includes('ai') || titleLower.includes('tech')) return techImg;
  
  // Fallback to category
  return MARKET_IMAGES[market.category.toLowerCase()];
}

export function MarketPage() {
  const { id } = useParams<{ id: string }>();
  const { currentMarket, isLoading, error, priceFlash, loadMarket, subscribeToUpdates } = useMarketStore();
  const { isWatched, toggleWatchlist } = useWatchlistStore();
  
  // Selected outcome for trade panel (multi-outcome markets)
  const [selectedOutcome, setSelectedOutcome] = useState<MarketOutcome | null>(null);

  useEffect(() => {
    if (id) {
      loadMarket(id);
    }
  }, [id, loadMarket]);

  useEffect(() => {
    if (id && currentMarket) {
      const unsubscribe = subscribeToUpdates(id);
      return unsubscribe;
    }
  }, [id, currentMarket, subscribeToUpdates]);
  
  // Set default selected outcome for multi-outcome markets
  useEffect(() => {
    if (currentMarket?.outcomes && currentMarket.outcomes.length > 0 && !selectedOutcome) {
      setSelectedOutcome(currentMarket.outcomes[0]);
    }
  }, [currentMarket, selectedOutcome]);

  // Generate order book for each outcome
  const generateOrderBookForOutcome = useMemo(() => {
    return (outcomeId: string): OrderBookType => {
      const outcome = currentMarket?.outcomes?.find(o => o.id === outcomeId);
      const basePrice = outcome?.yesPrice || 0.5;
      return generateMockOrderBook(basePrice);
    };
  }, [currentMarket?.outcomes]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !currentMarket) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Market not found</p>
        <Link to="/" className="text-primary hover:underline">Back to markets</Link>
      </div>
    );
  }

  const watched = id ? isWatched(id) : false;
  const isResolved = currentMarket.status === 'resolved';
  const hasOutcomes = currentMarket.outcomes && currentMarket.outcomes.length > 0;
  const marketImage = getMarketImage(currentMarket);

  // Mock user position for demo
  const mockUserPosition = {
    side: 'yes' as const,
    shares: 100,
    avgPrice: 0.65,
  };

  // Sort outcomes by probability
  const sortedOutcomes = hasOutcomes 
    ? [...currentMarket.outcomes!].sort((a, b) => b.yesPrice - a.yesPrice)
    : [];
  
  // Get current prices for trade panel
  const tradePanelProps = selectedOutcome 
    ? { yesPrice: selectedOutcome.yesPrice, noPrice: selectedOutcome.noPrice }
    : { yesPrice: currentMarket.yesPrice, noPrice: currentMarket.noPrice };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      {/* Market Header - Kalshi Style */}
      <div className="border-b border-border">
        <div className="container py-4">
          {/* Back link */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
            {/* Left: Image + Title */}
            <div className="flex gap-4 flex-1">
              {marketImage ? (
                <img
                  src={marketImage}
                  alt=""
                  className="h-16 w-16 rounded-xl object-cover flex-shrink-0"
                />
              ) : (
                <div className="h-16 w-16 rounded-xl bg-surface flex-shrink-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">{currentMarket.title.charAt(0)}</span>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  {currentMarket.category}
                </p>
                <h1 className="text-xl font-bold text-foreground">{currentMarket.title}</h1>
              </div>
            </div>

            {/* Right: Action buttons */}
            <div className="flex items-center gap-2">
              <button className="h-9 w-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface transition-colors relative">
                <RefreshCw className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 text-[10px] bg-primary text-primary-foreground px-1 rounded">247</span>
              </button>
              <button className="h-9 w-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface transition-colors">
                <Share2 className="h-4 w-4" />
              </button>
              <button className="h-9 w-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface transition-colors">
                <Download className="h-4 w-4" />
              </button>
              <button 
                onClick={() => id && toggleWatchlist(id)}
                className={cn(
                  'h-9 w-9 rounded-lg border flex items-center justify-center transition-colors',
                  watched
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border text-muted-foreground hover:text-foreground hover:bg-surface'
                )}
              >
                {watched ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Resolution Banner */}
      {isResolved && (
        <div className="container py-4">
          <ResolutionBanner market={currentMarket} userPosition={mockUserPosition} />
        </div>
      )}

      {/* Main Content */}
      <div className="container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Chart + Outcomes */}
          <div className="lg:col-span-2 space-y-6">
            {/* Outcome Legend above chart (for multi-outcome) */}
            {hasOutcomes && (
              <div className="flex items-center gap-6 text-sm">
                {sortedOutcomes.slice(0, 3).map((outcome, idx) => {
                  const colors = ['hsl(152, 69%, 41%)', 'hsl(213, 94%, 58%)', 'hsl(220, 13%, 46%)'];
                  return (
                    <div key={outcome.id} className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: colors[idx] }}
                      />
                      <span className="text-muted-foreground">{outcome.label}</span>
                      <span className="font-semibold text-foreground">
                        {Math.round(outcome.yesPrice * 100)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Chart */}
            <div className="rounded-xl border border-border bg-card p-5">
              <KalshiChart 
                priceHistory={currentMarket.priceHistory} 
                currentPrice={currentMarket.yesPrice}
                outcomes={currentMarket.outcomes}
                volume={currentMarket.volume}
              />
            </div>

            {/* Order Book for Binary Markets - under chart */}
            {!hasOutcomes && !isResolved && currentMarket.orderBook && (
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-sm font-medium text-foreground mb-4">Order Book</h3>
                <OrderBook orderBook={currentMarket.orderBook} />
              </div>
            )}

            {/* Per-outcome Order Books for Multi-outcome Markets */}
            {hasOutcomes && !isResolved && (
              <OutcomeOrderBook 
                outcomes={sortedOutcomes}
                generateOrderBook={generateOrderBookForOutcome}
              />
            )}

            {/* Binary Outcome Section */}
            {!hasOutcomes && !isResolved && (
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-5 py-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">Chance</span>
                </div>
                <div className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-yes/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-yes">Y</span>
                    </div>
                    <span className="font-medium text-foreground">Yes</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold">{Math.round(currentMarket.yesPrice * 100)}%</span>
                    <div className="flex gap-2">
                      <button className="px-5 py-2 text-sm font-medium rounded-lg bg-yes text-yes-foreground hover:bg-yes/90 transition-colors">
                        Yes {Math.round(currentMarket.yesPrice * 100)}¢
                      </button>
                      <button className="px-5 py-2 text-sm font-medium rounded-lg border border-no text-no hover:bg-no hover:text-no-foreground transition-colors">
                        No {Math.round(currentMarket.noPrice * 100)}¢
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Rules Summary */}
            <RulesSummary
              title={currentMarket.title}
              description={currentMarket.description}
              outcomes={currentMarket.outcomes}
              endsAt={currentMarket.endsAt}
            />

            {/* Comments Section */}
            <div className="rounded-xl border border-border bg-card">
              <div className="p-5">
                <CommentsSection 
                  marketId={currentMarket.id} 
                  outcomes={currentMarket.outcomes}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Trade Panel */}
          <div className="space-y-6">
            {!isResolved && (
              <PolymarketTradePanel
                yesPrice={tradePanelProps.yesPrice}
                noPrice={tradePanelProps.noPrice}
                liquidity={currentMarket.liquidity}
                orderBook={hasOutcomes ? undefined : currentMarket.orderBook}
                selectedOutcome={selectedOutcome ? { 
                  id: selectedOutcome.id, 
                  label: selectedOutcome.label,
                  imageUrl: selectedOutcome.imageUrl 
                } : null}
                priceFlash={priceFlash}
                showOrderBook={false}
              />
            )}
            {isResolved && (
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-lg font-semibold text-foreground mb-3">Market Resolved</h3>
                <p className="text-sm text-muted-foreground">
                  This market has been resolved. Trading is no longer available.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Trade Panel */}
      {!isResolved && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 border-t border-border bg-background">
          <div className="flex gap-3">
            <button className="yes-btn-lg">
              Yes {Math.round(currentMarket.yesPrice * 100)}¢
            </button>
            <button className="no-btn-lg">
              No {Math.round(currentMarket.noPrice * 100)}¢
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
