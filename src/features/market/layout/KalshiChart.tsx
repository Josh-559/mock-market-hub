import { useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { PricePoint } from '../market.types';
import type { MarketOutcome } from '@/features/markets/markets.types';
import { cn } from '@/shared/utils';

interface KalshiChartProps {
  priceHistory: PricePoint[];
  currentPrice: number;
  outcomes?: MarketOutcome[];
  volume?: number;
}

type TimeRange = '1D' | '1W' | '1M' | 'ALL';

const TIME_RANGES: TimeRange[] = ['1D', '1W', '1M', 'ALL'];

// Generate colors for multi-outcome lines
const OUTCOME_COLORS = [
  'hsl(152, 69%, 41%)', // Green
  'hsl(213, 94%, 58%)', // Blue
  'hsl(220, 13%, 46%)', // Gray
  'hsl(262, 83%, 58%)', // Purple
  'hsl(38, 92%, 50%)',  // Orange
];

export function KalshiChart({ priceHistory, currentPrice, outcomes, volume }: KalshiChartProps) {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('ALL');
  
  // Filter data based on time range
  const filteredData = useMemo(() => {
    if (priceHistory.length === 0) return [];
    
    const now = Date.now();
    const ranges: Record<TimeRange, number> = {
      '1D': 24 * 60 * 60 * 1000,
      '1W': 7 * 24 * 60 * 60 * 1000,
      '1M': 30 * 24 * 60 * 60 * 1000,
      'ALL': Infinity,
    };
    
    const cutoff = now - ranges[selectedRange];
    const filtered = selectedRange === 'ALL' 
      ? priceHistory 
      : priceHistory.filter(p => p.time >= cutoff);
    
    // Return at least some data
    return filtered.length > 0 ? filtered : priceHistory.slice(-10);
  }, [priceHistory, selectedRange]);

  // Format data for chart
  const chartData = useMemo(() => {
    return filteredData.map((point) => ({
      time: point.time,
      value: Math.round(point.value * 100),
      date: new Date(point.time).toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      }),
    }));
  }, [filteredData]);

  // Calculate min/max for Y axis
  const { minY, maxY } = useMemo(() => {
    if (chartData.length === 0) return { minY: 0, maxY: 100 };
    const values = chartData.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.1 || 5;
    return {
      minY: Math.max(0, Math.floor(min - padding)),
      maxY: Math.min(100, Math.ceil(max + padding)),
    };
  }, [chartData]);

  if (priceHistory.length === 0) {
    return (
      <div className="w-full h-[350px] flex items-center justify-center text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Outcome Legend (for multi-outcome markets) */}
      {outcomes && outcomes.length > 0 && (
        <div className="flex items-center gap-4 mb-4 text-sm">
          {outcomes.slice(0, 3).map((outcome, idx) => (
            <div key={outcome.id} className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: OUTCOME_COLORS[idx % OUTCOME_COLORS.length] }}
              />
              <span className="text-muted-foreground">{outcome.label}</span>
              <span className="font-medium text-foreground">
                {Math.round(outcome.yesPrice * 100)}%
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(152, 69%, 41%)" stopOpacity={0.15} />
                <stop offset="100%" stopColor="hsl(152, 69%, 41%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            
            {/* Grid lines */}
            <ReferenceLine y={25} stroke="hsl(220, 13%, 91%)" strokeDasharray="3 3" />
            <ReferenceLine y={50} stroke="hsl(220, 13%, 91%)" strokeDasharray="3 3" />
            <ReferenceLine y={75} stroke="hsl(220, 13%, 91%)" strokeDasharray="3 3" />
            <ReferenceLine y={100} stroke="hsl(220, 13%, 91%)" strokeDasharray="3 3" />
            
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'hsl(220, 9%, 46%)' }}
              interval="preserveStartEnd"
              minTickGap={60}
            />
            <YAxis 
              domain={[minY, maxY]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'hsl(220, 9%, 46%)' }}
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
                        {new Date(data.time).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
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
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom bar: Volume + Time Range */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
        {volume !== undefined && (
          <span className="text-sm text-muted-foreground">
            ${volume.toLocaleString()} vol
          </span>
        )}
        <div className="flex items-center gap-1 ml-auto">
          {TIME_RANGES.map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={cn(
                'px-2.5 py-1 text-xs font-medium rounded transition-colors',
                selectedRange === range
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
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
