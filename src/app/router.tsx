import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MarketList } from '@/features/markets/MarketList';
import { MarketPage } from '@/features/market/MarketPage';
import NotFound from '@/pages/NotFound';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MarketList />} />
        <Route path="/market/:id" element={<MarketPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
