import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { TrendingUp, Loader2 } from 'lucide-react';
import { useMarketStore } from './market.store';
import { MarketHeader } from './layout/Header';
import { MarketChart } from './layout/Chart';
import { TradePanel } from './layout/TradePanel';
import { OrderBook } from './layout/OrderBook';
import { MobileTabs } from './layout/MobileTabs';

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Predictex</span>
          </Link>
        </div>
      </header>

      <MarketHeader market={currentMarket} />

      {/* Mobile Layout */}
      <MobileTabs>
        {{
          chart: <MarketChart priceHistory={currentMarket.priceHistory} currentPrice={currentMarket.yesPrice} />,
          orderBook: orderBook ? <OrderBook orderBook={orderBook} /> : <p className="text-muted-foreground">No orderbook</p>,
          trades: <p className="text-muted-foreground text-sm">Recent trades will appear here</p>,
        }}
      </MobileTabs>

      {/* Desktop Layout */}
      <div className="hidden lg:block container py-6">
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <div className="rounded-xl border border-border bg-card p-4">
              <MarketChart priceHistory={currentMarket.priceHistory} currentPrice={currentMarket.yesPrice} />
            </div>
            {orderBook && <OrderBook orderBook={orderBook} />}
          </div>
          <div>
            <TradePanel
              yesPrice={currentMarket.yesPrice}
              noPrice={currentMarket.noPrice}
              liquidity={currentMarket.liquidity}
              priceFlash={priceFlash}
            />
          </div>
        </div>
      </div>

      {/* Mobile Trade Panel */}
      <div className="lg:hidden p-4 border-t border-border bg-surface/50">
        <TradePanel
          yesPrice={currentMarket.yesPrice}
          noPrice={currentMarket.noPrice}
          liquidity={currentMarket.liquidity}
          priceFlash={priceFlash}
        />
      </div>
    </div>
  );
}
