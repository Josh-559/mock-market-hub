import { useMemo, useState, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
  Dot,
} from "recharts";
import type { PricePoint } from "../market.types";
import type { MarketOutcome } from "@/features/markets/markets.types";
import { cn } from "@/shared/utils";

interface KalshiChartProps {
  priceHistory: PricePoint[];
  currentPrice: number;
  outcomes?: MarketOutcome[];
  volume?: number;
}

type TimeRange = "1H" | "6H" | "1D" | "1W" | "1M" | "ALL";

const TIME_RANGES: TimeRange[] = ["1H", "6H", "1D", "1W", "1M", "ALL"];

// Generate colors for multi-outcome lines
const OUTCOME_COLORS = [
  "hsl(152, 69%, 41%)", // Green
  "hsl(213, 94%, 58%)", // Blue
  "hsl(220, 13%, 46%)", // Gray
  "hsl(262, 83%, 58%)", // Purple
  "hsl(38, 92%, 50%)", // Orange
];

// Generate simulated price history for each outcome
function generateOutcomePriceHistory(
  basePrice: number,
  points: number = 51,
): number[] {
  const history: number[] = [];
  let currentPrice = basePrice - 0.15 + Math.random() * 0.1;

  for (let i = 0; i < points; i++) {
    const drift = (basePrice - currentPrice) * 0.08;
    const randomness = (Math.random() - 0.5) * 0.05;
    currentPrice = Math.max(
      0.01,
      Math.min(0.99, currentPrice + drift + randomness),
    );
    history.push(Math.round(currentPrice * 100));
  }

  // Ensure last point matches current price
  history[history.length - 1] = Math.round(basePrice * 100);

  return history;
}

// Pulsing dot component for the end of lines
function PulsingDot(props: any) {
  const { cx, cy, fill, isLast } = props;
  if (!isLast || !cx || !cy) return null;

  return (
    <g>
      {/* Outer pulsing ring */}
      <circle
        cx={cx}
        cy={cy}
        r={8}
        fill={fill}
        opacity={0.3}
        className="animate-ping"
        style={{ transformOrigin: `${cx}px ${cy}px`, animationDuration: "2s" }}
      />
      {/* Middle ring */}
      <circle cx={cx} cy={cy} r={5} fill={fill} opacity={0.5} />
      {/* Inner solid dot */}
      <circle cx={cx} cy={cy} r={3} fill={fill} />
    </g>
  );
}

export function KalshiChart({
  priceHistory,
  currentPrice,
  outcomes,
  volume,
}: KalshiChartProps) {
  const [selectedRange, setSelectedRange] = useState<TimeRange>("ALL");
  const [hoveredOutcome, setHoveredOutcome] = useState<string | null>(null);

  const isMultiOutcome = outcomes && outcomes.length > 0;

  // Filter data based on time range
  const filteredData = useMemo(() => {
    if (priceHistory.length === 0) return [];

    const now = Date.now();
    const ranges: Record<TimeRange, number> = {
      "1H": 60 * 60 * 1000,
      "6H": 6 * 60 * 60 * 1000,
      "1D": 24 * 60 * 60 * 1000,
      "1W": 7 * 24 * 60 * 60 * 1000,
      "1M": 30 * 24 * 60 * 60 * 1000,
      ALL: Infinity,
    };

    const cutoff = now - ranges[selectedRange];
    const filtered =
      selectedRange === "ALL"
        ? priceHistory
        : priceHistory.filter((p) => p.time >= cutoff);

    return filtered.length > 0 ? filtered : priceHistory.slice(-10);
  }, [priceHistory, selectedRange]);

  // Generate stable outcome histories (memoized to prevent re-generation)
  const outcomeHistories = useMemo(() => {
    if (!isMultiOutcome) return {};
    const histories: Record<string, number[]> = {};
    outcomes!.forEach((outcome) => {
      histories[outcome.id] = generateOutcomePriceHistory(outcome.yesPrice, 51);
    });
    return histories;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMultiOutcome, outcomes?.map((o) => o.id).join(",")]);

  // Generate multi-outcome chart data
  const multiOutcomeData = useMemo(() => {
    if (!isMultiOutcome || filteredData.length === 0) return [];

    return filteredData.map((point, idx) => {
      const dataPoint: Record<string, number | string | boolean> = {
        time: point.time,
        date: new Date(point.time).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        isLast: idx === filteredData.length - 1,
      };

      outcomes!.forEach((outcome) => {
        const history = outcomeHistories[outcome.id];
        if (history && history[idx] !== undefined) {
          dataPoint[outcome.id] = history[idx];
        } else {
          dataPoint[outcome.id] = Math.round(outcome.yesPrice * 100);
        }
      });

      return dataPoint;
    });
  }, [filteredData, outcomes, isMultiOutcome, outcomeHistories]);

  // Format data for single-outcome chart
  const singleOutcomeData = useMemo(() => {
    return filteredData.map((point, idx) => ({
      time: point.time,
      value: Math.round(point.value * 100),
      date: new Date(point.time).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      isLast: idx === filteredData.length - 1,
    }));
  }, [filteredData]);

  // Calculate min/max for Y axis
  const { minY, maxY } = useMemo(() => {
    if (isMultiOutcome && multiOutcomeData.length > 0) {
      let allValues: number[] = [];
      outcomes!.forEach((outcome) => {
        multiOutcomeData.forEach((d) => {
          const val = d[outcome.id];
          if (typeof val === "number") allValues.push(val);
        });
      });
      const min = Math.min(...allValues);
      const max = Math.max(...allValues);
      const padding = (max - min) * 0.15 || 5;
      return {
        minY: Math.max(0, Math.floor(min - padding)),
        maxY: Math.min(100, Math.ceil(max + padding)),
      };
    }

    if (singleOutcomeData.length === 0) return { minY: 0, maxY: 100 };
    const values = singleOutcomeData.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.1 || 5;
    return {
      minY: Math.max(0, Math.floor(min - padding)),
      maxY: Math.min(100, Math.ceil(max + padding)),
    };
  }, [singleOutcomeData, multiOutcomeData, outcomes, isMultiOutcome]);

  // Handle legend hover
  const handleLegendMouseEnter = useCallback((outcomeId: string) => {
    setHoveredOutcome(outcomeId);
  }, []);

  const handleLegendMouseLeave = useCallback(() => {
    setHoveredOutcome(null);
  }, []);

  if (priceHistory.length === 0) {
    return (
      <div className="w-full h-[350px] flex items-center justify-center text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Outcome Legend (for multi-outcome) */}
      {isMultiOutcome && (
        <div className="flex items-center gap-6 mb-4 text-sm">
          {outcomes!.slice(0, 5).map((outcome, idx) => {
            const color = OUTCOME_COLORS[idx % OUTCOME_COLORS.length];
            const isHovered = hoveredOutcome === outcome.id;
            const isDimmed = hoveredOutcome && !isHovered;

            return (
              <div
                key={outcome.id}
                className={cn(
                  "flex items-center gap-2 cursor-pointer transition-opacity duration-200",
                  isDimmed && "opacity-30",
                )}
                onMouseEnter={() => handleLegendMouseEnter(outcome.id)}
                onMouseLeave={handleLegendMouseLeave}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-muted-foreground">{outcome.label}</span>
                <span className="font-semibold text-foreground">
                  {Math.round(outcome.yesPrice * 100)}%
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Chart */}
      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {isMultiOutcome ? (
            // Multi-line chart for multiple outcomes
            <LineChart
              data={multiOutcomeData}
              margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
            >
              {/* Grid lines */}
              <ReferenceLine y={0} stroke="hsl(220, 13%, 91%)" />
              <ReferenceLine
                y={25}
                stroke="hsl(220, 13%, 91%)"
                strokeDasharray="3 3"
              />
              <ReferenceLine
                y={50}
                stroke="hsl(220, 13%, 91%)"
                strokeDasharray="3 3"
              />
              <ReferenceLine
                y={75}
                stroke="hsl(220, 13%, 91%)"
                strokeDasharray="3 3"
              />
              <ReferenceLine y={100} stroke="hsl(220, 13%, 91%)" />

              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "hsl(220, 9%, 46%)" }}
                interval="preserveStartEnd"
                minTickGap={60}
              />
              <YAxis
                domain={[minY, maxY]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "hsl(220, 9%, 46%)" }}
                tickFormatter={(value) => `${value}%`}
                width={45}
                orientation="right"
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
                        <div className="text-xs text-muted-foreground mb-2">
                          {label}
                        </div>
                        {payload.map((entry, idx) => {
                          const outcome = outcomes!.find(
                            (o) => o.id === entry.dataKey,
                          );
                          return (
                            <div
                              key={idx}
                              className="flex items-center gap-2 text-sm"
                            >
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="text-muted-foreground">
                                {outcome?.label}:
                              </span>
                              <span className="font-semibold text-foreground">
                                {entry.value}%
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {outcomes!.map((outcome, idx) => {
                const color = OUTCOME_COLORS[idx % OUTCOME_COLORS.length];
                const isHovered = hoveredOutcome === outcome.id;
                const isDimmed = hoveredOutcome && !isHovered;

                return (
                  <Line
                    key={outcome.id}
                    type="stepAfter"
                    dataKey={outcome.id}
                    stroke={color}
                    strokeWidth={isHovered ? 3 : 2}
                    strokeOpacity={isDimmed ? 0.2 : 1}
                    dot={(props: any) => {
                      const { payload } = props;
                      if (payload?.isLast && !isDimmed) {
                        return (
                          <PulsingDot {...props} fill={color} isLast={true} />
                        );
                      }
                      return null;
                    }}
                    activeDot={{ r: 4, fill: color }}
                    animationDuration={300}
                    onMouseEnter={() => setHoveredOutcome(outcome.id)}
                    onMouseLeave={() => setHoveredOutcome(null)}
                  />
                );
              })}
            </LineChart>
          ) : (
            // Single area chart for binary markets
            <AreaChart
              data={singleOutcomeData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="hsl(152, 69%, 41%)"
                    stopOpacity={0.15}
                  />
                  <stop
                    offset="100%"
                    stopColor="hsl(152, 69%, 41%)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              <ReferenceLine
                y={25}
                stroke="hsl(220, 13%, 91%)"
                strokeDasharray="3 3"
              />
              <ReferenceLine
                y={50}
                stroke="hsl(220, 13%, 91%)"
                strokeDasharray="3 3"
              />
              <ReferenceLine
                y={75}
                stroke="hsl(220, 13%, 91%)"
                strokeDasharray="3 3"
              />
              <ReferenceLine
                y={100}
                stroke="hsl(220, 13%, 91%)"
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "hsl(220, 9%, 46%)" }}
                interval="preserveStartEnd"
                minTickGap={60}
              />
              <YAxis
                domain={[minY, maxY]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "hsl(220, 9%, 46%)" }}
                tickFormatter={(value) => `${value}%`}
                width={45}
                orientation="right"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
                        <div className="text-sm font-semibold text-foreground">
                          {data.value}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(data.time).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="stepAfter"
                dataKey="value"
                stroke="hsl(152, 69%, 41%)"
                strokeWidth={2}
                fill="url(#chartGradient)"
                animationDuration={300}
                activeDot={(props: any) => {
                  const { payload } = props;
                  if (payload?.isLast) {
                    return (
                      <PulsingDot
                        {...props}
                        fill="hsl(152, 69%, 41%)"
                        isLast={true}
                      />
                    );
                  }
                  return <Dot {...props} r={4} fill="hsl(152, 69%, 41%)" />;
                }}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Bottom bar: Time Range */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
        {volume !== undefined && (
          <span className="text-sm text-muted-foreground">
            ₦{volume.toLocaleString()} vol
          </span>
        )}
        <div className="flex items-center gap-1 ml-auto">
          {TIME_RANGES.map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={cn(
                "px-2.5 py-1 text-xs font-medium rounded transition-colors",
                selectedRange === range
                  ? "bg-surface text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
