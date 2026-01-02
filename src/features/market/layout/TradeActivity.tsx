import { useEffect, useState } from 'react';
import { mockSocket } from '@/services/mockSocket';
import { cn } from '@/shared/utils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface TradeEvent {
  id: string;
  side: 'yes' | 'no';
  type: 'buy' | 'sell';
  price: number;
  quantity: number;
  timestamp: number;
}

export function TradeActivity() {
  const [trades, setTrades] = useState<TradeEvent[]>([]);

  useEffect(() => {
    const unsubscribe = mockSocket.on('TRADE_EXECUTED', (payload: any) => {
      const newTrade: TradeEvent = {
        id: `${Date.now()}-${Math.random()}`,
        side: payload.side,
        type: payload.type,
        price: payload.price,
        quantity: payload.quantity,
        timestamp: payload.timestamp,
      };
      setTrades((prev) => [newTrade, ...prev].slice(0, 20));
    });

    return () => unsubscribe();
  }, []);

  if (trades.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground">
        Waiting for trades...
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="grid grid-cols-4 gap-2 px-3 py-2 text-xs font-medium text-muted-foreground border-b border-border">
        <span>Time</span>
        <span>Side</span>
        <span className="text-right">Price</span>
        <span className="text-right">Qty</span>
      </div>
      <div className="max-h-64 overflow-y-auto">
        {trades.map((trade, index) => {
          const isNew = index === 0;
          const isBuy = trade.type === 'buy';
          return (
            <div
              key={trade.id}
              className={cn(
                'grid grid-cols-4 gap-2 px-3 py-2 text-sm',
                isNew && 'animate-flash-green',
                'hover:bg-surface transition-colors'
              )}
            >
              <span className="text-muted-foreground text-xs">
                {new Date(trade.timestamp).toLocaleTimeString()}
              </span>
              <span className={cn(
                'flex items-center gap-1 font-medium',
                trade.side === 'yes' ? 'text-yes' : 'text-no'
              )}>
                {isBuy ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {trade.side.toUpperCase()}
              </span>
              <span className="text-right font-mono">
                {(trade.price * 100).toFixed(0)}¢
              </span>
              <span className="text-right font-mono text-muted-foreground">
                {trade.quantity}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
