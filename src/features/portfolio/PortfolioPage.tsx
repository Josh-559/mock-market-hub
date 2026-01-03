import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Wallet,
  History,
  PieChart,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useAuthStore } from "@/features/auth/auth.store";
import { usePortfolioStore } from "./portfolio.store";
import { AppHeader } from "@/components/layout/AppHeader";
import { cn } from "@/shared/utils";
import dayjs from "dayjs";

export function PortfolioPage() {
  const navigate = useNavigate();
  const { isAuthenticated, balance } = useAuthStore();
  const {
    positions,
    tradeHistory,
    totalValue,
    totalPnl,
    totalPnlPercent,
    isLoading,
    loadPortfolio,
  } = usePortfolioStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    loadPortfolio();
  }, [isAuthenticated, navigate, loadPortfolio]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container py-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">Wallet</h1>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <SummaryCard
            icon={Wallet}
            label="Cash Balance"
            value={`$${balance.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}`}
          />
          <SummaryCard
            icon={PieChart}
            label="Wallet Value"
            value={`$${totalValue.toFixed(2)}`}
          />
          <SummaryCard
            icon={TrendingUp}
            label="Total P&L"
            value={`${totalPnl >= 0 ? "+" : ""}$${totalPnl.toFixed(2)}`}
            valueClass={totalPnl >= 0 ? "text-yes" : "text-no"}
            subtext={`${
              totalPnlPercent >= 0 ? "+" : ""
            }${totalPnlPercent.toFixed(1)}%`}
          />
          <SummaryCard
            icon={History}
            label="Total Trades"
            value={tradeHistory.length.toString()}
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Positions */}
            <div className="rounded-xl border border-border bg-card">
              <div className="px-5 py-4 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">
                  Open Positions
                </h2>
              </div>
              {positions.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <p>No open positions</p>
                  <Link
                    to="/"
                    className="text-primary text-sm hover:underline mt-2 inline-block"
                  >
                    Explore markets →
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {positions.map((position) => (
                    <PositionRow key={position.marketId} position={position} />
                  ))}
                </div>
              )}
            </div>

            {/* Trade History */}
            <div className="rounded-xl border border-border bg-card">
              <div className="px-5 py-4 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">
                  Trade History
                </h2>
              </div>
              {tradeHistory.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <p>No trades yet</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {tradeHistory.map((trade) => (
                    <TradeRow key={trade.id} trade={trade} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  valueClass,
  subtext,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  valueClass?: string;
  subtext?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-10 w-10 rounded-lg bg-surface flex items-center justify-center">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <p
          className={cn("text-2xl font-bold", valueClass || "text-foreground")}
        >
          {value}
        </p>
        {subtext && (
          <span className={cn("text-sm font-medium", valueClass)}>
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
}

function PositionRow({
  position,
}: {
  position: ReturnType<typeof usePortfolioStore.getState>["positions"][0];
}) {
  const isProfit = position.pnl >= 0;

  return (
    <Link
      to={`/market/${position.marketId}`}
      className="flex items-center justify-between p-4 hover:bg-surface transition-colors"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {position.marketTitle}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span
            className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full",
              position.side === "yes"
                ? "bg-yes-light text-yes"
                : "bg-no-light text-no"
            )}
          >
            {position.side.toUpperCase()}
          </span>
          <span className="text-xs text-muted-foreground">
            {position.shares} shares @ {(position.avgPrice * 100).toFixed(0)}¢
          </span>
        </div>
      </div>
      <div className="text-right ml-4">
        <p className="text-sm font-semibold text-foreground">
          ${position.currentValue.toFixed(2)}
        </p>
        <div
          className={cn(
            "flex items-center justify-end gap-1 text-xs font-medium",
            isProfit ? "text-yes" : "text-no"
          )}
        >
          {isProfit ? (
            <ArrowUpRight className="h-3 w-3" />
          ) : (
            <ArrowDownRight className="h-3 w-3" />
          )}
          <span>
            {isProfit ? "+" : ""}${position.pnl.toFixed(2)} (
            {position.pnlPercent.toFixed(1)}%)
          </span>
        </div>
      </div>
    </Link>
  );
}

function TradeRow({
  trade,
}: {
  trade: ReturnType<typeof usePortfolioStore.getState>["tradeHistory"][0];
}) {
  const isBuy = trade.type === "buy";

  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {trade.marketTitle}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span
            className={cn(
              "text-xs font-medium",
              isBuy ? "text-yes" : "text-no"
            )}
          >
            {trade.type.toUpperCase()}
          </span>
          <span
            className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full",
              trade.side === "yes"
                ? "bg-yes-light text-yes"
                : "bg-no-light text-no"
            )}
          >
            {trade.side.toUpperCase()}
          </span>
          <span className="text-xs text-muted-foreground">
            {trade.quantity} @ {(trade.price * 100).toFixed(0)}¢
          </span>
        </div>
      </div>
      <div className="text-right ml-4">
        <p className="text-sm font-semibold text-foreground">
          ${trade.total.toFixed(2)}
        </p>
        <p className="text-xs text-muted-foreground">
          {dayjs(trade.timestamp).format("MMM D, h:mm A")}
        </p>
      </div>
    </div>
  );
}
