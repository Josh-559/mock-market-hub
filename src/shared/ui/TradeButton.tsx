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
        'trade-btn w-full py-3 px-4 rounded-lg text-base font-semibold',
        'flex items-center justify-center gap-2',
        isYes ? 'trade-btn-yes' : 'trade-btn-no',
        className,
      )}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
