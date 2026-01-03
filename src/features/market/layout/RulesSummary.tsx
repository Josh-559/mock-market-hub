import { useState } from 'react';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';
import type { MarketOutcome } from '@/features/markets/markets.types';

interface RulesSummaryProps {
  title: string;
  description: string;
  outcomes?: MarketOutcome[];
  endsAt: string;
}

export function RulesSummary({ title, description, outcomes, endsAt }: RulesSummaryProps) {
  const [expanded, setExpanded] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState<string | null>(
    outcomes && outcomes.length > 0 ? outcomes[0].label : null
  );

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="px-5 py-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Rules summary</h2>
        <Info className="w-5 h-5 text-muted-foreground" />
      </div>
      
      <div className="px-5 pb-5">
        {/* Outcome selector for multi-outcome */}
        {outcomes && outcomes.length > 0 && (
          <button 
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-primary text-sm font-medium mb-3 hover:underline"
          >
            {selectedOutcome}
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        )}

        {/* Dropdown for outcomes */}
        {expanded && outcomes && (
          <div className="mb-3 p-2 border border-border rounded-lg bg-surface">
            {outcomes.map((outcome) => (
              <button
                key={outcome.id}
                onClick={() => {
                  setSelectedOutcome(outcome.label);
                  setExpanded(false);
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-surface-hover rounded transition-colors"
              >
                {outcome.label}
              </button>
            ))}
          </div>
        )}

        {/* Resolution description */}
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          {selectedOutcome ? (
            <>
              If <span className="font-medium text-foreground">{selectedOutcome}</span> wins, 
              the market resolves to <span className="text-primary font-medium">Yes</span>. 
              Outcome verified from official sources.
            </>
          ) : (
            <>
              {description}
            </>
          )}
        </p>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-surface transition-colors">
            View full rules
          </button>
          <button className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-surface transition-colors">
            Help center
          </button>
        </div>
      </div>
    </div>
  );
}
