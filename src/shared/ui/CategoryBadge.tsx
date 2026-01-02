import { cn } from '@/shared/utils';

interface CategoryBadgeProps {
  category: string;
  className?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  crypto: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  economics: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  politics: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  sports: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  science: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  tech: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  entertainment: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  other: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const colorClasses = CATEGORY_COLORS[category] || CATEGORY_COLORS.other;
  
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded border capitalize',
        colorClasses,
        className
      )}
    >
      {category}
    </span>
  );
}
