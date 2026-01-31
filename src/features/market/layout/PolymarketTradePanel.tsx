import { useState, useMemo } from "react";
import { Lock, AlertTriangle, ChevronDown, Info } from "lucide-react";
import { useTradeStore } from "@/features/trading/trade.store";
import { formatCurrency, formatShares } from "@/features/trading/trade.math";
import { cn } from "@/shared/utils";
import { notificationService } from "@/services/notificationService";
import { OrderBook } from "./OrderBook";
import type { OrderBook as OrderBookType } from "../market.types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PolymarketTradePanelProps {
  yesPrice: number;
  noPrice: number;
  liquidity: number;
  orderBook?: OrderBookType;
  selectedOutcome?: { id: string; label: string; imageUrl?: string } | null;
  priceFlash?: "up" | "down" | null;
  showOrderBook?: boolean;
}

type TradeMode = "buy" | "sell";
type OrderType = "market" | "limit";

const QUICK_AMOUNTS = [1, 20, 100];

export function PolymarketTradePanel({
  yesPrice,
  noPrice,
  liquidity,
  orderBook,
  selectedOutcome,
  priceFlash,
  showOrderBook = true,
}: PolymarketTradePanelProps) {
  const [tradeMode, setTradeMode] = useState<TradeMode>("buy");
  const [orderType, setOrderType] = useState<OrderType>("market");
  const [limitPrice, setLimitPrice] = useState("");

  const {
    selectedSide,
    amount,
    shares,
    payout,
    profit,
    returnPercent,
    estimatedSlippage,
    isSubmitting,
    priceLocked,
    setSelectedSide,
    setAmount,
    setCurrentMarket,
    submitOrder,
  } = useTradeStore();

  // Update store when market prices change
  useState(() => {
    setCurrentMarket(yesPrice, noPrice, liquidity);
  });

  const currentPrice = selectedSide === "yes" ? yesPrice : noPrice;
  const hasAmount = amount && parseFloat(amount) > 0;

  // Calculate potential return based on trade mode
  const potentialReturn = useMemo(() => {
    if (!hasAmount) return 0;
    const amountNum = parseFloat(amount);
    const price =
      orderType === "limit" && limitPrice
        ? parseFloat(limitPrice) / 100
        : currentPrice;

    if (tradeMode === "buy") {
      const sharesCalc = Math.floor(amountNum / price);
      return sharesCalc - amountNum;
    } else {
      // Sell mode - you get the price * quantity
      return amountNum * price;
    }
  }, [amount, currentPrice, orderType, limitPrice, hasAmount, tradeMode]);

  const handleSubmit = async () => {
    if (!hasAmount) return;

    const result = await submitOrder();

    if (result.success) {
      notificationService.notifyTradeExecuted(
        selectedSide,
        result.shares,
        result.avgPrice,
      );
    } else {
      notificationService.notifyTradeFailed(result.error || "Unknown error");
    }
  };

  const handleQuickAmount = (quickAmount: number) => {
    const currentAmount = parseFloat(amount) || 0;
    setAmount((currentAmount + quickAmount).toString());
  };

  return (
    <div className="sticky top-20">
      <div className="rounded-xl border border-border bg-card ">
        {/* Selected Outcome Header */}
        {selectedOutcome && (
          <div className="flex items-center gap-3 p-4 border-b border-border">
            {selectedOutcome.imageUrl ? (
              <img
                src={selectedOutcome.imageUrl}
                alt=""
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center">
                <span className="font-bold text-sm">
                  {selectedOutcome.label.charAt(0)}
                </span>
              </div>
            )}
            <span className="font-semibold text-foreground">
              {selectedOutcome.label}
            </span>
          </div>
        )}

        <div className="p-4">
          {/* Buy/Sell Toggle + Order Type */}
          <div className="flex items-center justify-between mb-4">
            {/* Buy/Sell Toggle - Actual Toggle */}
            <div className="flex bg-surface rounded-lg p-1">
              <button
                onClick={() => setTradeMode("buy")}
                className={cn(
                  "px-4 py-1.5 text-sm font-semibold rounded-md transition-all",
                  tradeMode === "buy"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Buy
              </button>
              <button
                onClick={() => setTradeMode("sell")}
                className={cn(
                  "px-4 py-1.5 text-sm font-semibold rounded-md transition-all",
                  tradeMode === "sell"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Sell
              </button>
            </div>

            {/* Order Type Dropdown - Working */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {orderType === "market" ? "Market" : "Limit"}
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setOrderType("market")}>
                  <div className="flex flex-col">
                    <span className="font-medium">Market</span>
                    <span className="text-xs text-muted-foreground">
                      Execute at best available price
                    </span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setOrderType("limit")}>
                  <div className="flex flex-col">
                    <span className="font-medium">Limit</span>
                    <span className="text-xs text-muted-foreground">
                      Set your own price
                    </span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Side Selection - Yes/No */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={() => setSelectedSide("yes")}
              className={cn(
                "py-3 rounded-lg text-sm font-semibold transition-all",
                selectedSide === "yes"
                  ? "bg-yes text-yes-foreground"
                  : "bg-yes/10 text-yes hover:bg-yes/20",
              )}
            >
              Yes {(yesPrice * 100).toFixed(0)}¢
            </button>
            <button
              onClick={() => setSelectedSide("no")}
              className={cn(
                "py-3 rounded-lg text-sm font-semibold transition-all",
                selectedSide === "no"
                  ? "bg-no text-no-foreground"
                  : "bg-no/10 text-no hover:bg-no/20",
              )}
            >
              No {(noPrice * 100).toFixed(0)}¢
            </button>
          </div>

          {/* Limit Price Input (if limit order) */}
          {orderType === "limit" && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                Limit Price
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  placeholder={`${(currentPrice * 100).toFixed(0)}`}
                  min="1"
                  max="99"
                  className="w-full h-12 px-4 rounded-lg border border-border bg-background text-lg font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  ¢
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Order will execute when price reaches{" "}
                {limitPrice || (currentPrice * 100).toFixed(0)}¢
              </p>
            </div>
          )}

          {/* Amount Input */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground">
                {tradeMode === "buy" ? "Amount" : "Shares to sell"}
              </label>
              <span className="text-2xl font-bold text-muted-foreground">
                {tradeMode === "buy" ? `₦${amount || "0"}` : amount || "0"}
              </span>
            </div>

            {/* Quick amounts */}
            <div className="grid grid-cols-4 gap-1 w-full">
              {QUICK_AMOUNTS.map((quickAmount) => (
                <button
                  key={quickAmount}
                  onClick={() => handleQuickAmount(quickAmount)}
                  className="px-2 py-2 text-sm font-medium rounded-lg border
                 border-border text-muted-foreground
                 hover:text-foreground hover:bg-surface"
                >
                  +₦{quickAmount}
                </button>
              ))}
              <button className="px-2 py-2 text-sm rounded-lg border">
                Max
              </button>
            </div>
          </div>

          {/* Trade Details */}
          {hasAmount && (
            <div className="space-y-2 mb-4 p-3 rounded-lg bg-surface text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {tradeMode === "buy" ? "Shares" : "Proceeds"}
                </span>
                <span className="text-foreground font-medium">
                  {tradeMode === "buy"
                    ? formatShares(shares)
                    : `₦${potentialReturn.toFixed(2)}`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Avg price</span>
                <span className="text-foreground">
                  {orderType === "limit" && limitPrice
                    ? `${limitPrice}¢`
                    : `${(currentPrice * 100).toFixed(1)}¢`}
                </span>
              </div>
              {tradeMode === "buy" && (
                <>
                  <div className="border-t border-border my-2 pt-2" />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">To Receive</span>
                    <span
                      className={cn(
                        "font-bold text-2xl",
                        potentialReturn >= 0 ? "text-yes" : "text-no",
                      )}
                    >
                      {formatCurrency(potentialReturn)}
                    </span>
                  </div>
                </>
              )}

              {estimatedSlippage > 0.5 && orderType === "market" && (
                <div className="flex items-center gap-2 pt-2 text-warning text-xs">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Est. slippage: {estimatedSlippage.toFixed(1)}%</span>
                </div>
              )}
            </div>
          )}

          {/* Price Lock Indicator */}
          {priceLocked && (
            <div className="flex items-center gap-2 mb-3 text-xs text-primary">
              <Lock className="h-3 w-3" />
              <span>Price locked for execution</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!hasAmount || isSubmitting}
            className={cn(
              "w-full py-3 px-4 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed",
              tradeMode === "buy"
                ? selectedSide === "yes"
                  ? "bg-yes text-yes-foreground hover:bg-yes/90"
                  : "bg-no text-no-foreground hover:bg-no/90"
                : "bg-primary text-primary-foreground hover:bg-primary/90",
            )}
          >
            {isSubmitting
              ? "Submitting..."
              : tradeMode === "buy"
                ? `Buy ${selectedSide.toUpperCase()}`
                : `Sell ${selectedSide.toUpperCase()}`}
          </button>

          {/* Terms */}
          <p className="text-xs text-muted-foreground text-center mt-3">
            By trading, you agree to the{" "}
            <span className="underline cursor-pointer">Terms of Use</span>.
          </p>
        </div>

        {/* Order Book Section - Only show for single markets */}
        {showOrderBook && orderBook && (
          <div className="border-t border-border p-4">
            <h4 className="text-sm font-medium text-foreground mb-3">
              Order Book
            </h4>
            <OrderBook orderBook={orderBook} />
          </div>
        )}
      </div>

      {/* ========= */}
      {/* ========= */}
      {/* ========= */}
      {/* ========= */}
      {/* === About Sponsorship === */}
      <div className="flex flex-col items-center justify-center text-center mt-5">
        <h3 className="text-[12px] font-[600] text-foreground mb-1">
          About{" "}
          <a
            href="https://capital.tekedia.com/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#0b64f4", textDecoration: "underline" }}
          >
            Tekedia
          </a>
        </h3>
        <p className="text-[10px] text-muted-foreground">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Nemo quis
          itaque modi excepturi minus.
        </p>
      </div>

      {/* ======= */}
      {/* ======= */}
      {/* ======= */}
      {/* ======= */}
      {/* ======= */}
      {/* ======= */}
      {/* ======= */}
      <div className="rounded-xl border border-border bg-card p-3 mt-5">
        <div className=" flex items-center mb-2">
          <h2 className="text-[14px] font-bold text-foreground mr-2 ">
            Prize Details
          </h2>
          <Info className="w-3 h-3 text-muted-foreground" />
        </div>

        <div className="px-0 pb-0 text-[11px]">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quae ratione
          doloribus architecto odio repellat possimus suscipit placeat earum
          dicta corrupti laudantium consequuntur, ea nulla et.
        </div>
      </div>
    </div>
  );
}
