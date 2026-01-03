import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import type { MarketDetail } from "../market.types";
import { cn } from "@/shared/utils";

interface StickyMarketHeaderProps {
  market: MarketDetail;
  scrollContainerRef?: React.RefObject<HTMLElement>;
}

export function StickyMarketHeader({ market }: StickyMarketHeaderProps) {
  const [isSticky, setIsSticky] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "-24px 0px 0px 0px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const yesPercent = Math.round(market.yesPrice * 100);

  return (
    <>
      {/* Sentinel element - triggers sticky state when it leaves viewport */}
      <div ref={sentinelRef} className="h-0" />

      {/* Sticky header */}
      <div
        ref={headerRef}
        className={cn(
          "fixed top-15 left-0 right-0 z-40 transition-all duration-300 ease-out",
          isSticky
            ? "opacity-100 translate-y-0 border-b border-border bg-background/95 backdrop-blur-sm shadow-sm"
            : "opacity-0 -translate-y-full pointer-events-none"
        )}
      >
        <div className="container py-3">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>

            {market.imageUrl ? (
              <img
                src={market.imageUrl}
                alt=""
                className="h-8 w-8 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <div className="h-8 w-8 rounded-lg bg-surface flex-shrink-0 flex items-center justify-center">
                <span className="text-sm font-medium">
                  {market.title.charAt(0)}
                </span>
              </div>
            )}

            <h1 className="text-sm font-semibold text-foreground truncate flex-1">
              {market.title}
            </h1>

            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-lg font-bold text-foreground">
                {yesPercent}%
              </span>
              <span className="text-xs text-muted-foreground">Yes</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
