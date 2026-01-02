import { cn } from '@/shared/utils';
import type { OrderBook as OrderBookType } from '../market.types';

interface OrderBookProps {
  orderBook: OrderBookType;
}

export function OrderBook({ orderBook }: OrderBookProps) {
  const maxQuantity = Math.max(
    ...orderBook.bids.map((b) => b.quantity),
    ...orderBook.asks.map((a) => a.quantity)
  );

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-3 px-4 py-2 text-xs font-medium text-muted-foreground border-b border-border bg-surface">
        <span>Price</span>
        <span className="text-center">Qty</span>
        <span className="text-right">Total</span>
      </div>
      
      {/* Asks (sells) - reversed to show highest first */}
      <div className="divide-y divide-border-subtle">
        {orderBook.asks.slice().reverse().slice(0, 5).map((ask, i) => (
          <OrderBookRow
            key={`ask-${i}`}
            price={ask.price}
            quantity={ask.quantity}
            side="ask"
            maxQuantity={maxQuantity}
          />
        ))}
      </div>
      
      {/* Spread indicator */}
      <div className="px-4 py-2 bg-surface border-y border-border">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Spread</span>
          <span className="font-mono text-foreground">
            {((orderBook.asks[0]?.price || 0) - (orderBook.bids[0]?.price || 0)).toFixed(2)}¢
          </span>
        </div>
      </div>
      
      {/* Bids (buys) */}
      <div className="divide-y divide-border-subtle">
        {orderBook.bids.slice(0, 5).map((bid, i) => (
          <OrderBookRow
            key={`bid-${i}`}
            price={bid.price}
            quantity={bid.quantity}
            side="bid"
            maxQuantity={maxQuantity}
          />
        ))}
      </div>
    </div>
  );
}

function OrderBookRow({
  price,
  quantity,
  side,
  maxQuantity,
}: {
  price: number;
  quantity: number;
  side: 'bid' | 'ask';
  maxQuantity: number;
}) {
  const percentage = (quantity / maxQuantity) * 100;
  const total = price * quantity;
  const isBid = side === 'bid';

  return (
    <div className="orderbook-row">
      {/* Background bar */}
      <div
        className={cn('orderbook-bar', isBid ? 'bg-yes' : 'bg-no')}
        style={{ width: `${percentage}%` }}
      />
      
      {/* Content */}
      <span className={cn('relative font-mono text-xs', isBid ? 'text-yes' : 'text-no')}>
        {(price * 100).toFixed(1)}¢
      </span>
      <span className="relative text-center font-mono text-xs text-foreground">
        {quantity.toLocaleString()}
      </span>
      <span className="relative text-right font-mono text-xs text-muted-foreground">
        ${(total / 1000).toFixed(1)}K
      </span>
    </div>
  );
}
