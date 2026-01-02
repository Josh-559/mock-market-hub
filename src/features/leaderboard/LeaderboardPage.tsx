import { useEffect, useState } from 'react';
import { Trophy, TrendingUp, Target, Medal } from 'lucide-react';
import { AppHeader } from '@/components/layout/AppHeader';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Trader } from './leaderboard.types';
import leaderboardData from '@/mocks/leaderboard.json';

export function LeaderboardPage() {
  const [traders, setTraders] = useState<Trader[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'profit' | 'winRate'>('profit');

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setTraders(leaderboardData.traders);
      setIsLoading(false);
    }, 300);
  }, []);

  const sortedTraders = [...traders].sort((a, b) => {
    if (sortBy === 'profit') {
      return b.totalProfit - a.totalProfit;
    }
    return b.winRate - a.winRate;
  });

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-600">
          <Trophy className="w-4 h-4" />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-500">
          <Medal className="w-4 h-4" />
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-600">
          <Medal className="w-4 h-4" />
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center w-8 h-8 text-muted-foreground font-medium">
        {rank}
      </div>
    );
  };

  const formatProfit = (profit: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(profit);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground mb-2">Leaderboard</h1>
          <p className="text-muted-foreground">Top traders ranked by performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Trophy className="w-4 h-4" />
              <span>Top Profit</span>
            </div>
            <p className="text-xl font-semibold text-success">
              {traders[0] ? formatProfit(traders[0].totalProfit) : '-'}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Target className="w-4 h-4" />
              <span>Best Win Rate</span>
            </div>
            <p className="text-xl font-semibold text-foreground">
              {traders.length > 0
                ? `${Math.max(...traders.map((t) => t.winRate)).toFixed(1)}%`
                : '-'}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Total Traders</span>
            </div>
            <p className="text-xl font-semibold text-foreground">{traders.length}</p>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <Tabs value={sortBy} onValueChange={(v) => setSortBy(v as 'profit' | 'winRate')}>
            <div className="border-b border-border px-4">
              <TabsList className="bg-transparent h-12">
                <TabsTrigger
                  value="profit"
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-foreground rounded-none"
                >
                  By Profit
                </TabsTrigger>
                <TabsTrigger
                  value="winRate"
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-foreground rounded-none"
                >
                  By Win Rate
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="profit" className="mt-0">
              <LeaderboardTable traders={sortedTraders} isLoading={isLoading} getRankBadge={getRankBadge} formatProfit={formatProfit} />
            </TabsContent>
            <TabsContent value="winRate" className="mt-0">
              <LeaderboardTable traders={sortedTraders} isLoading={isLoading} getRankBadge={getRankBadge} formatProfit={formatProfit} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

interface LeaderboardTableProps {
  traders: Trader[];
  isLoading: boolean;
  getRankBadge: (rank: number) => React.ReactNode;
  formatProfit: (profit: number) => string;
}

function LeaderboardTable({ traders, isLoading, getRankBadge, formatProfit }: LeaderboardTableProps) {
  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading leaderboard...
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-16">Rank</TableHead>
          <TableHead>Trader</TableHead>
          <TableHead className="text-right">Profit</TableHead>
          <TableHead className="text-right">Win Rate</TableHead>
          <TableHead className="text-right hidden sm:table-cell">Trades</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {traders.map((trader, index) => (
          <TableRow key={trader.id} className="hover:bg-muted/50">
            <TableCell>{getRankBadge(index + 1)}</TableCell>
            <TableCell>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground">
                  {trader.username.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-foreground">{trader.username}</span>
              </div>
            </TableCell>
            <TableCell className="text-right">
              <span className="text-success font-medium">{formatProfit(trader.totalProfit)}</span>
            </TableCell>
            <TableCell className="text-right">
              <span className="text-foreground">{trader.winRate.toFixed(1)}%</span>
            </TableCell>
            <TableCell className="text-right hidden sm:table-cell">
              <span className="text-muted-foreground">
                {trader.winningTrades}/{trader.totalTrades}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
