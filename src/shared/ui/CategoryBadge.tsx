import { cn } from '@/shared/utils';

interface CategoryBadgeProps {
  category: string;
  className?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  crypto: 'bg-amber-100 text-amber-700 border-amber-200',
  economics: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  politics: 'bg-blue-100 text-blue-700 border-blue-200',
  sports: 'bg-orange-100 text-orange-700 border-orange-200',
  science: 'bg-purple-100 text-purple-700 border-purple-200',
  tech: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  entertainment: 'bg-pink-100 text-pink-700 border-pink-200',
  other: 'bg-gray-100 text-gray-700 border-gray-200',
};

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const colorClasses = CATEGORY_COLORS[category] || CATEGORY_COLORS.other;
  
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border capitalize',
        colorClasses,
        className
      )}
    >
      {category}
    </span>
  );
}
