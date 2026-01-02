import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, ArrowLeft, Share2, Star, MessageSquare } from 'lucide-react';
import { useMarketStore } from './market.store';
import { MarketChart } from './layout/Chart';
import { TradePanel } from './layout/TradePanel';
import { OrderBook } from './layout/OrderBook';
import { MobileTabs } from './layout/MobileTabs';
import { CommentsSection } from './layout/CommentsSection';
import { ResolutionBanner } from './layout/ResolutionBanner';
import { AppHeader } from '@/components/layout/AppHeader';
import { formatVolume, formatTimeRemaining } from '@/shared/utils';

export function MarketPage() {
  const { id } = useParams<{ id: string }>();
  const { currentMarket, orderBook, isLoading, error, priceFlash, loadMarket, subscribeToUpdates } = useMarketStore();

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

  const yesPercent = Math.round(currentMarket.yesPrice * 100);
  const isResolved = currentMarket.status === 'resolved';
  const isPending = currentMarket.status === 'pending';

  // Mock user position for demo
  const mockUserPosition = {
    side: 'yes' as const,
    shares: 100,
    avgPrice: 0.65,
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      {/* Market Header */}
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

          <div className="flex flex-col lg:flex-row lg:items-start gap-4">
            {/* Market Image & Title */}
            <div className="flex gap-4 flex-1">
              {currentMarket.imageUrl ? (
                <img
                  src={currentMarket.imageUrl}
                  alt=""
                  className="h-14 w-14 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="h-14 w-14 rounded-lg bg-surface flex-shrink-0 flex items-center justify-center">
                  <span className="text-2xl">{currentMarket.title.charAt(0)}</span>
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-foreground mb-1">{currentMarket.title}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{formatVolume(currentMarket.volume)} Vol.</span>
                  {!isResolved && <span>Ends {formatTimeRemaining(currentMarket.endsAt)}</span>}
                  {isResolved && (
                    <span className={currentMarket.resolvedOutcome === 'yes' ? 'text-yes' : 'text-no'}>
                      Resolved: {currentMarket.resolvedOutcome?.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button className="h-9 px-4 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-surface transition-colors flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </button>
              <button className="h-9 px-4 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-surface transition-colors flex items-center gap-2">
                <Star className="h-4 w-4" />
                Watch
              </button>
            </div>
          </div>

          {/* Current Probability */}
          {!isResolved && (
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">{yesPercent}%</span>
              <span className="text-sm text-muted-foreground">chance of Yes</span>
            </div>
          )}
        </div>
      </div>

      {/* Resolution Banner */}
      {(isResolved || isPending) && (
        <div className="container py-4">
          <ResolutionBanner market={currentMarket} userPosition={mockUserPosition} />
        </div>
      )}

      {/* Mobile Layout */}
      <MobileTabs>
        {{
          chart: <MarketChart priceHistory={currentMarket.priceHistory} currentPrice={currentMarket.yesPrice} />,
          orderBook: orderBook ? <OrderBook orderBook={orderBook} /> : <p className="text-muted-foreground">No orderbook</p>,
          trades: <CommentsSection marketId={currentMarket.id} />,
        }}
      </MobileTabs>

      {/* Desktop Layout */}
      <div className="hidden lg:block container py-6">
        <div className="grid grid-cols-3 gap-6">
          {/* Left - Chart & Details */}
          <div className="col-span-2 space-y-6">
            {/* Chart */}
            <div className="rounded-xl border border-border bg-card p-4">
              <MarketChart priceHistory={currentMarket.priceHistory} currentPrice={currentMarket.yesPrice} />
            </div>

            {/* Options Table - Kalshi style */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-5 py-3 border-b border-border">
                <h2 className="text-sm font-semibold text-foreground">Outcomes</h2>
              </div>
              <div className="divide-y divide-border">
                {/* Yes Row */}
                <div className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-foreground">Yes</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-foreground">{yesPercent}%</span>
                    {!isResolved && (
                      <div className="flex gap-2">
                        <button className="yes-no-btn yes-no-btn-yes px-4 py-1.5">Yes {(currentMarket.yesPrice * 100).toFixed(0)}¢</button>
                        <button className="yes-no-btn yes-no-btn-no px-4 py-1.5">No {(currentMarket.noPrice * 100).toFixed(0)}¢</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Book */}
            {orderBook && !isResolved && (
              <div className="rounded-xl border border-border bg-card">
                <div className="px-5 py-3 border-b border-border">
                  <h2 className="text-sm font-semibold text-foreground">Order Book</h2>
                </div>
                <div className="p-5">
                  <OrderBook orderBook={orderBook} />
                </div>
              </div>
            )}

            {/* Market Description */}
            <div className="rounded-xl border border-border bg-card">
              <div className="px-5 py-3 border-b border-border">
                <h2 className="text-sm font-semibold text-foreground">About this market</h2>
              </div>
              <div className="p-5">
                <p className="text-sm text-muted-foreground leading-relaxed">{currentMarket.description}</p>
              </div>
            </div>

            {/* Comments Section */}
            <div className="rounded-xl border border-border bg-card">
              <div className="px-5 py-3 border-b border-border flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground">Discussion</h2>
              </div>
              <div className="p-5">
                <CommentsSection marketId={currentMarket.id} />
              </div>
            </div>
          </div>

          {/* Right - Trade Panel */}
          <div>
            {!isResolved && (
              <TradePanel
                yesPrice={currentMarket.yesPrice}
                noPrice={currentMarket.noPrice}
                liquidity={currentMarket.liquidity}
                priceFlash={priceFlash}
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
              Yes {(currentMarket.yesPrice * 100).toFixed(0)}¢
            </button>
            <button className="no-btn-lg">
              No {(currentMarket.noPrice * 100).toFixed(0)}¢
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
