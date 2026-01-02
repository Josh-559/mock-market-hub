import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MarketList } from '@/features/markets/MarketList';
import { MarketPage } from '@/features/market/MarketPage';
import { AuthPage } from '@/features/auth/AuthPage';
import { PortfolioPage } from '@/features/portfolio/PortfolioPage';
import { LeaderboardPage } from '@/features/leaderboard/LeaderboardPage';
import NotFound from '@/pages/NotFound';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MarketList />} />
        <Route path="/market/:id" element={<MarketPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
