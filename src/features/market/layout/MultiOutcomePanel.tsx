import { useState } from 'react';
import type { MarketOutcome } from '@/features/markets/markets.types';
import { cn } from '@/shared/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface MultiOutcomePanelProps {
  outcomes: MarketOutcome[];
  isResolved?: boolean;
  resolvedOutcome?: string;
}

export function MultiOutcomePanel({ outcomes, isResolved, resolvedOutcome }: MultiOutcomePanelProps) {
  const [expandedOutcome, setExpandedOutcome] = useState<string | null>(null);

  // Sort outcomes by probability (yesPrice)
  const sortedOutcomes = [...outcomes].sort((a, b) => b.yesPrice - a.yesPrice);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-5 py-3 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">Outcomes</h2>
      </div>
      <div className="divide-y divide-border">
        {sortedOutcomes.map((outcome) => {
          const percent = Math.round(outcome.yesPrice * 100);
          const isWinner = resolvedOutcome === outcome.id;
          const isExpanded = expandedOutcome === outcome.id;

          return (
            <div key={outcome.id} className="overflow-hidden">
              {/* Main Row */}
              <button
                onClick={() => setExpandedOutcome(isExpanded ? null : outcome.id)}
                className={cn(
                  'w-full flex items-center justify-between px-5 py-4 hover:bg-surface transition-colors text-left',
                  isWinner && 'bg-yes/5'
                )}
              >
                <div className="flex items-center gap-3 flex-1">
                  {/* Progress bar background */}
                  <div className="relative flex-1">
                    <div 
                      className={cn(
                        'absolute inset-y-0 left-0 rounded-full',
                        isWinner ? 'bg-yes/20' : 'bg-primary/10'
                      )}
                      style={{ width: `${percent}%` }}
                    />
                    <span className="relative text-sm font-medium text-foreground z-10 py-1 px-2">
                      {outcome.label}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {isWinner && (
                    <span className="text-xs font-medium text-yes bg-yes/10 px-2 py-0.5 rounded">
                      Winner
                    </span>
                  )}
                  <span className={cn(
                    'text-sm font-semibold',
                    isWinner ? 'text-yes' : 'text-foreground'
                  )}>
                    {percent}%
                  </span>
                  {!isResolved && (
                    isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )
                  )}
                </div>
              </button>

              {/* Expanded Trading Row */}
              {isExpanded && !isResolved && (
                <div className="px-5 py-4 bg-surface border-t border-border">
                  <p className="text-xs text-muted-foreground mb-3">
                    Trade on whether <strong>{outcome.label}</strong> will win
                  </p>
                  <div className="flex gap-3">
                    <button className="yes-btn-lg flex flex-col items-center">
                      <span>Yes</span>
                      <span className="text-xs mt-0.5 opacity-80">
                        Buy @ {(outcome.yesPrice * 100).toFixed(0)}¢
                      </span>
                    </button>
                    <button className="no-btn-lg flex flex-col items-center">
                      <span>No</span>
                      <span className="text-xs mt-0.5 opacity-80">
                        Buy @ {(outcome.noPrice * 100).toFixed(0)}¢
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Market Type Explanation */}
      <div className="px-5 py-3 bg-surface border-t border-border">
        <p className="text-xs text-muted-foreground">
          This is a multi-outcome market. Trade Yes/No on each outcome independently.
          Prices don't need to sum to 100%.
        </p>
      </div>
    </div>
  );
}
