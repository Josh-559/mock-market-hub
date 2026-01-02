import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Trophy, Target, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { AppHeader } from '@/components/layout/AppHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Trader } from './leaderboard.types';
import leaderboardData from '@/mocks/leaderboard.json';
import dayjs from 'dayjs';

interface TraderPosition {
  id: string;
  marketId: string;
  marketTitle: string;
  side: 'yes' | 'no';
  shares: number;
  avgPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
}

interface TraderTrade {
  id: string;
  marketTitle: string;
  side: 'yes' | 'no';
  type: 'buy' | 'sell';
  price: number;
  quantity: number;
  timestamp: string;
}

// Mock trader positions and trades
const MOCK_POSITIONS: TraderPosition[] = [
  {
    id: '1',
    marketId: 'btc-100k-2026',
    marketTitle: 'Will Bitcoin reach $100k in 2026?',
    side: 'yes',
    shares: 1200,
    avgPrice: 0.65,
    currentPrice: 0.72,
    pnl: 84,
    pnlPercent: 10.77,
  },
  {
    id: '2',
    marketId: 'fed-rate-cut-q1',
    marketTitle: 'Fed rate cut in Q1 2026?',
    side: 'no',
    shares: 800,
    avgPrice: 0.48,
    currentPrice: 0.52,
    pnl: -32,
    pnlPercent: -8.33,
  },
];

const MOCK_TRADES: TraderTrade[] = [
  {
    id: '1',
    marketTitle: 'Will Bitcoin reach $100k in 2026?',
    side: 'yes',
    type: 'buy',
    price: 0.65,
    quantity: 1200,
    timestamp: '2025-12-30T14:30:00Z',
  },
  {
    id: '2',
    marketTitle: 'Fed rate cut in Q1 2026?',
    side: 'no',
    type: 'buy',
    price: 0.48,
    quantity: 800,
    timestamp: '2025-12-29T10:15:00Z',
  },
  {
    id: '3',
    marketTitle: 'Trump wins 2028 election?',
    side: 'yes',
    type: 'sell',
    price: 0.55,
    quantity: 500,
    timestamp: '2025-12-28T16:45:00Z',
  },
];

export function TraderProfilePage() {
  const { traderId } = useParams<{ traderId: string }>();
  const [trader, setTrader] = useState<Trader | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      const found = leaderboardData.traders.find(t => t.id === traderId);
      setTrader(found || null);
      setIsLoading(false);
    }, 300);
  }, [traderId]);

  const formatProfit = (profit: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(profit);
  };

  const getAvatarGradient = (username: string) => {
    const gradients = [
      'from-orange-400 to-pink-500',
      'from-green-400 to-cyan-500',
      'from-purple-400 to-pink-500',
      'from-yellow-400 to-orange-500',
      'from-blue-400 to-purple-500',
    ];
    const index = username.charCodeAt(0) % gradients.length;
    return gradients[index];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">Loading profile...</div>
        </main>
      </div>
    );
  }

  if (!trader) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-xl font-semibold text-foreground mb-2">Trader not found</h1>
            <Link to="/leaderboard" className="text-primary hover:underline">
              Back to leaderboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link
          to="/leaderboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to leaderboard
        </Link>

        {/* Profile Header */}
        <div className="flex items-start gap-4 mb-8">
          <div className={`h-16 w-16 rounded-full bg-gradient-to-br ${getAvatarGradient(trader.username)}`} />
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-foreground">{trader.username}</h1>
              {trader.rank <= 3 && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">
                  <Trophy className="h-3 w-3" />
                  #{trader.rank}
                </div>
              )}
            </div>
            <p className="text-muted-foreground mt-1">Active trader since Dec 2025</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Total Profit</span>
            </div>
            <p className="text-xl font-semibold text-success">
              {formatProfit(trader.totalProfit)}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Target className="w-4 h-4" />
              <span>Win Rate</span>
            </div>
            <p className="text-xl font-semibold text-foreground">
              {trader.winRate.toFixed(1)}%
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Calendar className="w-4 h-4" />
              <span>Total Trades</span>
            </div>
            <p className="text-xl font-semibold text-foreground">{trader.totalTrades}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Trophy className="w-4 h-4" />
              <span>Winning Trades</span>
            </div>
            <p className="text-xl font-semibold text-foreground">{trader.winningTrades}</p>
          </div>
        </div>

        {/* Performance Chart Placeholder */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h3 className="text-sm font-medium text-foreground mb-4">Performance</h3>
          <div className="h-48 flex items-center justify-center border border-dashed border-border rounded-lg">
            <div className="text-center">
              <TrendingUp className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Performance chart</p>
            </div>
          </div>
        </div>

        {/* Positions & Trade History Tabs */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <Tabs defaultValue="positions">
            <div className="border-b border-border px-4">
              <TabsList className="bg-transparent h-12">
                <TabsTrigger
                  value="positions"
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-foreground rounded-none"
                >
                  Open Positions
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-foreground rounded-none"
                >
                  Trade History
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="positions" className="mt-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Market</TableHead>
                    <TableHead>Side</TableHead>
                    <TableHead className="text-right">Shares</TableHead>
                    <TableHead className="text-right">Avg Price</TableHead>
                    <TableHead className="text-right">P&L</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_POSITIONS.map((position) => (
                    <TableRow key={position.id} className="hover:bg-muted/50">
                      <TableCell>
                        <Link
                          to={`/market/${position.marketId}`}
                          className="font-medium text-foreground hover:text-primary transition-colors"
                        >
                          {position.marketTitle}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className={position.side === 'yes' ? 'text-success' : 'text-destructive'}>
                          {position.side.toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{position.shares}</TableCell>
                      <TableCell className="text-right">${position.avgPrice.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {position.pnl >= 0 ? (
                            <TrendingUp className="h-3 w-3 text-success" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-destructive" />
                          )}
                          <span className={position.pnl >= 0 ? 'text-success' : 'text-destructive'}>
                            ${Math.abs(position.pnl).toFixed(0)} ({position.pnlPercent >= 0 ? '+' : ''}{position.pnlPercent.toFixed(1)}%)
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="history" className="mt-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Market</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_TRADES.map((trade) => (
                    <TableRow key={trade.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium text-foreground">
                        {trade.marketTitle}
                      </TableCell>
                      <TableCell>
                        <span className={trade.type === 'buy' ? 'text-success' : 'text-destructive'}>
                          {trade.type.toUpperCase()} {trade.side.toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">${trade.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{trade.quantity}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {dayjs(trade.timestamp).format('MMM D, HH:mm')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
