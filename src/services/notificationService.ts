// Notification service for user trade confirmations only
import { toast } from 'sonner';

class NotificationService {
  notifyTradeExecuted(side: 'yes' | 'no', quantity: number, price: number) {
    toast.success(`Order Placed`, {
      description: `Bought ${quantity} ${side.toUpperCase()} shares @ ${(price * 100).toFixed(0)}¢`,
      position: 'top-right',
    });
  }

  notifyTradeFailed(error: string) {
    toast.error('Order Failed', {
      description: error,
      position: 'top-right',
    });
  }

  notifyResolution(marketTitle: string, outcome: 'yes' | 'no', payout?: number) {
    toast.success(`Market Resolved: ${outcome.toUpperCase()}`, {
      description: marketTitle + (payout ? ` | Payout: $${payout.toFixed(2)}` : ''),
      position: 'top-right',
      duration: 6000,
    });
  }
}

export const notificationService = new NotificationService();
