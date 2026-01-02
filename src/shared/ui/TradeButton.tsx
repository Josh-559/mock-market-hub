import { cn } from '@/shared/utils';
import { Loader2 } from 'lucide-react';

interface TradeButtonProps {
  side: 'yes' | 'no';
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function TradeButton({
  side,
  onClick,
  disabled = false,
  loading = false,
  children,
  className,
}: TradeButtonProps) {
  const isYes = side === 'yes';
  
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'w-full py-3 px-4 rounded-lg text-sm font-semibold',
        'flex items-center justify-center gap-2 transition-all',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        isYes 
          ? 'bg-yes text-yes-foreground hover:bg-yes/90' 
          : 'bg-no text-no-foreground hover:bg-no/90',
        className,
      )}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
