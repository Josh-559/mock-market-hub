import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WatchlistStore {
  watchedMarketIds: string[];
  addToWatchlist: (marketId: string) => void;
  removeFromWatchlist: (marketId: string) => void;
  isWatched: (marketId: string) => boolean;
  toggleWatchlist: (marketId: string) => void;
}

export const useWatchlistStore = create<WatchlistStore>()(
  persist(
    (set, get) => ({
      watchedMarketIds: [],
      
      addToWatchlist: (marketId: string) => {
        set((state) => ({
          watchedMarketIds: state.watchedMarketIds.includes(marketId)
            ? state.watchedMarketIds
            : [...state.watchedMarketIds, marketId],
        }));
      },
      
      removeFromWatchlist: (marketId: string) => {
        set((state) => ({
          watchedMarketIds: state.watchedMarketIds.filter((id) => id !== marketId),
        }));
      },
      
      isWatched: (marketId: string) => {
        return get().watchedMarketIds.includes(marketId);
      },
      
      toggleWatchlist: (marketId: string) => {
        const isCurrentlyWatched = get().isWatched(marketId);
        if (isCurrentlyWatched) {
          get().removeFromWatchlist(marketId);
        } else {
          get().addToWatchlist(marketId);
        }
      },
    }),
    {
      name: 'watchlist-storage',
    }
  )
);
