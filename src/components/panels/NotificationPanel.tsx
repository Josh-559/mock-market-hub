import { useState, useEffect } from 'react';
import { X, Check, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/shared/utils';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface Notification {
  id: string;
  type: 'trade' | 'resolution' | 'alert' | 'system';
  title: string;
  description: string;
  timestamp: number;
  read: boolean;
  side?: 'yes' | 'no';
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mock notifications
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'trade',
    title: 'Order Filled',
    description: 'Bought 50 YES shares @ 65¢ on "Ukraine ceasefire by March"',
    timestamp: Date.now() - 5 * 60 * 1000,
    read: false,
    side: 'yes',
  },
  {
    id: '2',
    type: 'trade',
    title: 'Order Filled',
    description: 'Sold 25 NO shares @ 42¢ on "Bitcoin above $100k"',
    timestamp: Date.now() - 30 * 60 * 1000,
    read: false,
    side: 'no',
  },
  {
    id: '3',
    type: 'resolution',
    title: 'Market Resolved: YES',
    description: '"Fed Rate Cut in January" resolved YES. You won $150!',
    timestamp: Date.now() - 2 * 60 * 60 * 1000,
    read: true,
    side: 'yes',
  },
  {
    id: '4',
    type: 'alert',
    title: 'Price Alert',
    description: '"Trump 2024" crossed 75% threshold',
    timestamp: Date.now() - 6 * 60 * 60 * 1000,
    read: true,
  },
  {
    id: '5',
    type: 'system',
    title: 'Welcome!',
    description: 'Your account is set up and ready to trade.',
    timestamp: Date.now() - 24 * 60 * 60 * 1000,
    read: true,
  },
];

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const getIcon = (notification: Notification) => {
    switch (notification.type) {
      case 'trade':
        return notification.side === 'yes' 
          ? <TrendingUp className="h-4 w-4 text-yes" />
          : <TrendingDown className="h-4 w-4 text-no" />;
      case 'resolution':
        return <Check className="h-4 w-4 text-yes" />;
      case 'alert':
        return <AlertCircle className="h-4 w-4 text-warning" />;
      default:
        return <AlertCircle className="h-4 w-4 text-primary" />;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="absolute right-0 top-full mt-2 w-80 max-h-[70vh] rounded-lg border border-border bg-card shadow-lg z-50 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-primary hover:text-primary/80 transition-colors"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No notifications yet
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  className={cn(
                    'px-4 py-3 hover:bg-surface transition-colors cursor-pointer',
                    !notification.read && 'bg-primary/5'
                  )}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getIcon(notification)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">
                          {notification.title}
                        </span>
                        {!notification.read && (
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {notification.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {dayjs(notification.timestamp).fromNow()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-border">
          <button className="text-xs text-primary hover:text-primary/80 transition-colors">
            View all notifications
          </button>
        </div>
      </div>
    </>
  );
}
