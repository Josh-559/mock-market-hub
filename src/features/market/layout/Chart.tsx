import { useEffect, useRef } from 'react';
import type { PricePoint } from '../market.types';

interface MarketChartProps {
  priceHistory: PricePoint[];
  currentPrice: number;
}

export function MarketChart({ priceHistory, currentPrice }: MarketChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Simple SVG chart as fallback - lightweight-charts API issues
  const width = 600;
  const height = 300;
  const padding = 40;
  
  if (priceHistory.length === 0) {
    return <div className="w-full h-[300px] lg:h-[400px] flex items-center justify-center text-muted-foreground">No data</div>;
  }

  const values = priceHistory.map(p => p.value);
  const minVal = Math.min(...values) * 0.95;
  const maxVal = Math.max(...values) * 1.05;
  const range = maxVal - minVal || 0.1;

  const points = priceHistory.map((p, i) => {
    const x = padding + (i / (priceHistory.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((p.value - minVal) / range) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full h-[300px] lg:h-[400px]" ref={containerRef}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(pct => (
          <line key={pct} x1={padding} y1={padding + pct * (height - 2 * padding)} x2={width - padding} y2={padding + pct * (height - 2 * padding)} stroke="hsl(220, 14%, 18%)" strokeWidth="1" />
        ))}
        {/* Price line */}
        <polyline fill="none" stroke="hsl(213, 94%, 58%)" strokeWidth="2" points={points} />
        {/* Current price dot */}
        <circle cx={width - padding} cy={height - padding - ((currentPrice - minVal) / range) * (height - 2 * padding)} r="4" fill="hsl(213, 94%, 58%)" />
        {/* Y-axis labels */}
        <text x={padding - 5} y={padding} fill="hsl(215, 16%, 55%)" fontSize="10" textAnchor="end">{(maxVal * 100).toFixed(0)}¢</text>
        <text x={padding - 5} y={height - padding} fill="hsl(215, 16%, 55%)" fontSize="10" textAnchor="end">{(minVal * 100).toFixed(0)}¢</text>
      </svg>
    </div>
  );
}
