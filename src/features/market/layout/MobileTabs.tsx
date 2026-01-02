import { useState } from 'react';
import { cn } from '@/shared/utils';

interface MobileTabsProps {
  children: {
    chart: React.ReactNode;
    orderBook: React.ReactNode;
    trades: React.ReactNode;
  };
}

type TabId = 'chart' | 'orderBook' | 'trades';

const TABS: { id: TabId; label: string }[] = [
  { id: 'chart', label: 'Chart' },
  { id: 'orderBook', label: 'Order Book' },
  { id: 'trades', label: 'Trades' },
];

export function MobileTabs({ children }: MobileTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('chart');

  return (
    <div className="lg:hidden">
      {/* Tab headers */}
      <div className="flex border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-1 py-3 text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'text-foreground border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Tab content */}
      <div className="p-4">
        {activeTab === 'chart' && children.chart}
        {activeTab === 'orderBook' && children.orderBook}
        {activeTab === 'trades' && children.trades}
      </div>
    </div>
  );
}
