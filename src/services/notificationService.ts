// Real-time notification service
import { toast } from 'sonner';
import { mockSocket } from './mockSocket';

export type NotificationType = 'trade' | 'price_alert' | 'resolution';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: Date;
}

class NotificationService {
  private isSubscribed = false;

  subscribe(): () => void {
    if (this.isSubscribed) return () => {};
    this.isSubscribed = true;

    // Listen for trade executions
    const unsubTrade = mockSocket.on('TRADE_EXECUTED', (payload: any) => {
      const isBuy = payload.type === 'buy';
      const side = payload.side.toUpperCase();
      toast.success(`Trade Executed`, {
        description: `${isBuy ? 'Bought' : 'Sold'} ${payload.quantity} ${side} @ ${(payload.price * 100).toFixed(0)}¢`,
        position: 'top-right',
      });
    });

    // Listen for price updates (alerts for significant changes)
    const unsubPrice = mockSocket.on('PRICE_UPDATE', (payload: any) => {
      const change = payload.priceChange;
      if (Math.abs(change) > 0.03) {
        const direction = change > 0 ? 'up' : 'down';
        const percent = (Math.abs(change) * 100).toFixed(1);
        toast.info(`Price Alert`, {
          description: `${payload.marketId} moved ${direction} ${percent}%`,
          position: 'top-right',
        });
      }
    });

    return () => {
      unsubTrade();
      unsubPrice();
      this.isSubscribed = false;
    };
  }

  notifyResolution(marketTitle: string, outcome: 'yes' | 'no', payout?: number) {
    toast.success(`Market Resolved: ${outcome.toUpperCase()}`, {
      description: marketTitle + (payout ? ` | Payout: $${payout.toFixed(2)}` : ''),
      position: 'top-right',
      duration: 6000,
    });
  }

  notifyTrade(side: 'yes' | 'no', quantity: number, price: number) {
    toast.success(`Order Placed`, {
      description: `${quantity} ${side.toUpperCase()} shares @ ${(price * 100).toFixed(0)}¢`,
      position: 'top-right',
    });
  }
}

export const notificationService = new NotificationService();
