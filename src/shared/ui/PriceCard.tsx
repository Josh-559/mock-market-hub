import { cn } from '@/shared/utils';

interface PriceCardProps {
  side: 'yes' | 'no';
  price: number;
  isSelected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  flash?: 'up' | 'down' | null;
}

export function PriceCard({
  side,
  price,
  isSelected = false,
  onClick,
  size = 'md',
  showLabel = true,
  flash,
}: PriceCardProps) {
  const isYes = side === 'yes';
  const percentage = (price * 100).toFixed(0);
  
  const sizeClasses = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4',
  };
  
  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };
  
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-1 flex flex-col items-center justify-center rounded-lg border-2 transition-all duration-150',
        sizeClasses[size],
        isYes 
          ? 'border-yes/30 bg-yes-light hover:bg-yes hover:text-yes-foreground hover:border-yes' 
          : 'border-no/30 bg-no-light hover:bg-no hover:text-no-foreground hover:border-no',
        isSelected && (isYes ? 'bg-yes text-yes-foreground border-yes' : 'bg-no text-no-foreground border-no'),
        onClick && 'cursor-pointer',
        flash === 'up' && 'animate-flash-green',
        flash === 'down' && 'animate-flash-red',
      )}
    >
      {showLabel && (
        <span className={cn(
          'text-xs font-semibold uppercase tracking-wider mb-0.5',
          isSelected 
            ? (isYes ? 'text-yes-foreground' : 'text-no-foreground')
            : (isYes ? 'text-yes' : 'text-no')
        )}>
          {isYes ? 'Yes' : 'No'}
        </span>
      )}
      <span className={cn(
        'font-bold tabular-nums',
        textSizes[size],
        isSelected 
          ? (isYes ? 'text-yes-foreground' : 'text-no-foreground')
          : (isYes ? 'text-yes' : 'text-no')
      )}>
        {percentage}¢
      </span>
    </button>
  );
}
