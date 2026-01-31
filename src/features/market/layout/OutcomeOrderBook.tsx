import { useState } from "react";
import { cn } from "@/shared/utils";
import type { OrderBook as OrderBookType } from "../market.types";
import type { MarketOutcome } from "@/features/markets/markets.types";
import { ExternalLink } from "lucide-react";

interface OutcomeOrderBookProps {
  outcomes: MarketOutcome[];
  generateOrderBook: (outcomeId: string) => OrderBookType;
}

type TabType = "orderbook" | "graph" | "resolution";

// Generate random order book for an outcome
export function generateMockOrderBook(basePrice: number): OrderBookType {
  const bids: { price: number; quantity: number }[] = [];
  const asks: { price: number; quantity: number }[] = [];

  // Generate asks (sell orders) - prices above current
  for (let i = 0; i < 5; i++) {
    asks.push({
      price: basePrice + (i + 1) * 0.01,
      quantity: Math.floor(Math.random() * 50000) + 1000,
    });
  }

  // Generate bids (buy orders) - prices below current
  for (let i = 0; i < 5; i++) {
    bids.push({
      price: Math.max(0.01, basePrice - (i + 1) * 0.01),
      quantity: Math.floor(Math.random() * 50000) + 1000,
    });
  }

  return {
    bids: bids.sort((a, b) => b.price - a.price),
    asks: asks.sort((a, b) => a.price - b.price),
  };
}

export function OutcomeOrderBook({
  outcomes,
  generateOrderBook,
}: OutcomeOrderBookProps) {
  const [selectedOutcome, setSelectedOutcome] = useState(outcomes[0]);
  const [activeTab, setActiveTab] = useState<TabType>("orderbook");

  const orderBook = generateOrderBook(selectedOutcome.id);
  const spread =
    (orderBook.asks[0]?.price || 0) - (orderBook.bids[0]?.price || 0);
  const lastPrice = orderBook.bids[0]?.price || selectedOutcome.yesPrice;

  // Calculate max quantity for bar widths
  const maxQuantity = Math.max(
    ...orderBook.bids.map((b) => b.quantity),
    ...orderBook.asks.map((a) => a.quantity),
  );

  return (
    <div className="space-y-4">
      {/* Outcome Selector */}
      <div className="space-y-2">
        {outcomes.map((outcome) => {
          const isSelected = selectedOutcome.id === outcome.id;
          const percent = Math.round(outcome.yesPrice * 100);
          const priceChange = Math.floor(Math.random() * 5) - 2;

          return (
            <div
              key={outcome.id}
              onClick={() => setSelectedOutcome(outcome)}
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-colors",
                isSelected
                  ? "bg-surface border-2 border-primary"
                  : "hover:bg-surface/50",
              )}
            >
              <div className="flex items-center gap-3">
                {outcome.imageUrl ? (
                  <img
                    src={outcome.imageUrl}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-xs font-bold">
                    {outcome.label.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {outcome.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ₦
                    {(
                      outcome.volume || Math.floor(Math.random() * 5000000)
                    ).toLocaleString()}{" "}
                    Vol.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-lg font-bold text-foreground">
                    {percent}%
                  </span>
                  {priceChange !== 0 && (
                    <span
                      className={cn(
                        "text-xs ml-1",
                        priceChange > 0 ? "text-yes" : "text-no",
                      )}
                    >
                      {priceChange > 0 ? "▲" : "▼"}
                      {Math.abs(priceChange)}%
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 text-xs font-medium rounded-lg bg-yes text-yes-foreground hover:bg-yes/90 transition-colors">
                    Buy Yes {percent}¢
                  </button>
                  <button className="px-4 py-2 text-xs font-medium rounded-lg bg-no/10 text-no border border-no/30 hover:bg-no hover:text-no-foreground transition-colors">
                    Buy No {100 - percent}¢
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Book Section for Selected Outcome */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Tabs */}
        <div className="flex items-center justify-between px-4 border-b border-border">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab("orderbook")}
              className={cn(
                "py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
                activeTab === "orderbook"
                  ? "text-foreground border-foreground"
                  : "text-muted-foreground border-transparent hover:text-foreground",
              )}
            >
              Order Book
            </button>
            {/* <button
              onClick={() => setActiveTab("graph")}
              className={cn(
                "py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
                activeTab === "graph"
                  ? "text-foreground border-foreground"
                  : "text-muted-foreground border-transparent hover:text-foreground"
              )}
            >
              Graph
            </button>
            <button
              onClick={() => setActiveTab("resolution")}
              className={cn(
                "py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
                activeTab === "resolution"
                  ? "text-foreground border-foreground"
                  : "text-muted-foreground border-transparent hover:text-foreground"
              )}
            >
              Resolutionkk
            </button> */}
          </div>
          <button className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
            Rewards <ExternalLink className="h-3 w-3" />
          </button>
        </div>

        {activeTab === "orderbook" && (
          <div className="p-4">
            {/* TRADE YES Label */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <span className="font-medium">TRADE YES</span>
              <span className="text-muted-foreground">⊡</span>
            </div>

            {/* Order Book Table */}
            <div className="overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-3 gap-4 px-4 py-2 text-xs font-medium text-muted-foreground uppercase">
                <span>Price</span>
                <span className="text-right">Shares</span>
                <span className="text-right">Total</span>
              </div>

              {/* Asks (Sells) - Red */}
              <div className="relative">
                {orderBook.asks
                  .slice()
                  .reverse()
                  .slice(0, 4)
                  .map((ask, i) => {
                    const percent = (ask.quantity / maxQuantity) * 100;
                    const total = ask.price * ask.quantity;
                    return (
                      <div
                        key={`ask-${i}`}
                        className="grid grid-cols-3 gap-4 px-4 py-2 relative text-sm"
                      >
                        {/* Background bar */}
                        <div
                          className="absolute left-0 top-0 bottom-0 bg-no/10"
                          style={{ width: `${percent}%` }}
                        />
                        <span className="relative text-no font-mono">
                          {Math.round(ask.price * 100)}¢
                        </span>
                        <span className="relative text-right text-foreground font-mono">
                          {ask.quantity.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                        <span className="relative text-right text-muted-foreground font-mono">
                          ₦
                          {(total / 100).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    );
                  })}
              </div>

              {/* Spread */}
              <div className="flex items-center justify-between px-4 py-3 bg-surface text-sm">
                <span className="text-muted-foreground">
                  Last: {Math.round(lastPrice * 100)}¢
                </span>
                <span className="text-muted-foreground">
                  Spread: {Math.round(spread * 100)}¢
                </span>
              </div>

              {/* Bids (Buys) - Green */}
              <div className="relative">
                {orderBook.bids.slice(0, 4).map((bid, i) => {
                  const percent = (bid.quantity / maxQuantity) * 100;
                  const total = bid.price * bid.quantity;
                  return (
                    <div
                      key={`bid-${i}`}
                      className="grid grid-cols-3 gap-4 px-4 py-2 relative text-sm"
                    >
                      {/* Background bar */}
                      <div
                        className="absolute left-0 top-0 bottom-0 bg-yes/10"
                        style={{ width: `${percent}%` }}
                      />
                      <span className="relative text-yes font-mono">
                        {Math.round(bid.price * 100)}¢
                      </span>
                      <span className="relative text-right text-foreground font-mono">
                        {bid.quantity.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                      <span className="relative text-right text-muted-foreground font-mono">
                        ₦
                        {(total / 100).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === "graph" && (
          <div className="p-8 text-center text-muted-foreground text-sm">
            Depth chart coming soon
          </div>
        )}

        {activeTab === "resolution" && (
          <div className="p-8 text-center text-muted-foreground text-sm">
            Resolution details coming soon
          </div>
        )}
      </div>
    </div>
  );
}
