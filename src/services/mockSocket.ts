// Mock WebSocket service for real-time updates
type EventHandler = (data: unknown) => void;

export type SocketEvent = 
  | 'PRICE_UPDATE'
  | 'ORDERBOOK_UPDATE'
  | 'TRADE_EXECUTED'
  | 'POSITION_UPDATE';

interface SocketMessage {
  type: SocketEvent;
  payload: unknown;
}

class MockSocket {
  private handlers: Map<SocketEvent, EventHandler[]> = new Map();
  private intervals: NodeJS.Timeout[] = [];
  private isConnected = false;

  connect(): void {
    if (this.isConnected) return;
    this.isConnected = true;
    console.log('[MockSocket] Connected');
    this.startSimulation();
  }

  disconnect(): void {
    if (!this.isConnected) return;
    this.isConnected = false;
    this.intervals.forEach(clearInterval);
    this.intervals = [];
    console.log('[MockSocket] Disconnected');
  }

  on(event: SocketEvent, handler: EventHandler): () => void {
    const handlers = this.handlers.get(event) || [];
    handlers.push(handler);
    this.handlers.set(event, handlers);

    // Return unsubscribe function
    return () => {
      const currentHandlers = this.handlers.get(event) || [];
      this.handlers.set(
        event,
        currentHandlers.filter((h) => h !== handler)
      );
    };
  }

  private emit(event: SocketEvent, payload: unknown): void {
    const handlers = this.handlers.get(event) || [];
    handlers.forEach((handler) => handler(payload));
  }

  private startSimulation(): void {
    // Simulate price updates every 2-5 seconds
    const priceInterval = setInterval(() => {
      if (!this.isConnected) return;
      
      const marketIds = ['btc-100k-2026', 'fed-rate-cut-q1', 'spacex-mars-2026'];
      const marketId = marketIds[Math.floor(Math.random() * marketIds.length)];
      
      // Generate small price movement (-0.02 to +0.02)
      const priceChange = (Math.random() - 0.5) * 0.04;
      
      this.emit('PRICE_UPDATE', {
        marketId,
        priceChange,
        timestamp: Date.now(),
      });
    }, 2000 + Math.random() * 3000);

    // Simulate orderbook updates every 1-3 seconds
    const orderbookInterval = setInterval(() => {
      if (!this.isConnected) return;
      
      this.emit('ORDERBOOK_UPDATE', {
        marketId: 'btc-100k-2026',
        side: Math.random() > 0.5 ? 'bid' : 'ask',
        price: 0.70 + Math.random() * 0.1,
        quantity: Math.floor(Math.random() * 5000) + 1000,
        timestamp: Date.now(),
      });
    }, 1000 + Math.random() * 2000);

    // Simulate trade executions every 3-8 seconds
    const tradeInterval = setInterval(() => {
      if (!this.isConnected) return;
      
      this.emit('TRADE_EXECUTED', {
        marketId: 'btc-100k-2026',
        side: Math.random() > 0.5 ? 'yes' : 'no',
        type: Math.random() > 0.5 ? 'buy' : 'sell',
        price: 0.70 + Math.random() * 0.1,
        quantity: Math.floor(Math.random() * 1000) + 100,
        timestamp: Date.now(),
      });
    }, 3000 + Math.random() * 5000);

    this.intervals.push(priceInterval, orderbookInterval, tradeInterval);
  }
}

// Singleton instance
export const mockSocket = new MockSocket();
