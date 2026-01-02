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
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };
  
  return (
    <button
      onClick={onClick}
      className={cn(
        'price-card flex flex-col items-center justify-center rounded-lg transition-all duration-150',
        sizeClasses[size],
        isYes ? 'price-card-yes' : 'price-card-no',
        isSelected && (isYes ? 'ring-2 ring-yes glow-yes' : 'ring-2 ring-no glow-no'),
        onClick && 'cursor-pointer',
        flash === 'up' && 'animate-flash-green',
        flash === 'down' && 'animate-flash-red',
      )}
    >
      {showLabel && (
        <span className={cn(
          'text-xs font-semibold uppercase tracking-wider mb-1',
          isYes ? 'text-yes' : 'text-no'
        )}>
          {isYes ? 'Yes' : 'No'}
        </span>
      )}
      <span className={cn(
        'font-bold tabular-nums',
        textSizes[size],
        isYes ? 'text-yes' : 'text-no'
      )}>
        {percentage}¢
      </span>
    </button>
  );
}
