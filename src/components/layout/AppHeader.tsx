import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TrendingUp, Search, Bell, Menu, User, LogOut, Wallet } from 'lucide-react';
import { useAuthStore } from '@/features/auth/auth.store';
import { DepositWithdrawModal } from '@/components/modals/DepositWithdrawModal';
import { cn } from '@/shared/utils';

export function AppHeader() {
  const location = useLocation();
  const { isAuthenticated, user, balance, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);

  const navLinks = [
    { href: '/', label: 'Markets' },
    { href: '/categories', label: 'Categories' },
    { href: '/leaderboard', label: 'Leaderboard' },
    { href: '/portfolio', label: 'Portfolio', requiresAuth: true },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-background">
        <div className="container">
          <div className="flex items-center justify-between h-14">
            {/* Left - Logo & Nav */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold text-foreground">Kalshi</span>
              </Link>

              {/* Navigation */}
              <nav className="hidden md:flex items-center gap-6">
                {navLinks.map((link) => {
                  if (link.requiresAuth && !isAuthenticated) return null;
                  const isActive = location.pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      to={link.href}
                      className={cn(
                        'nav-link',
                        isActive && 'nav-link-active text-foreground'
                      )}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right - Search, Auth, Balance */}
            <div className="flex items-center gap-3">
              {/* Search (desktop) */}
              <div className="hidden lg:block relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search markets or profiles"
                  className="w-64 h-9 pl-9 pr-4 rounded-full bg-surface border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {isAuthenticated ? (
                <>
                  {/* Balance - Click to deposit */}
                  <button
                    onClick={() => setShowDepositModal(true)}
                    className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    <Wallet className="h-4 w-4" />
                    ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </button>

                  {/* Notifications */}
                  <button className="h-9 w-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface transition-colors">
                    <Bell className="h-4 w-4" />
                  </button>

                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="h-9 w-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
                    >
                      <Menu className="h-4 w-4" />
                    </button>

                    {showUserMenu && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowUserMenu(false)}
                        />
                        <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-border bg-card shadow-lg z-50 overflow-hidden">
                          <div className="px-4 py-3 border-b border-border">
                            <p className="text-sm font-medium text-foreground">{user?.username}</p>
                            <p className="text-xs text-muted-foreground">{user?.email}</p>
                          </div>
                          <div className="py-1">
                            <Link
                              to="/portfolio"
                              className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-surface transition-colors"
                              onClick={() => setShowUserMenu(false)}
                            >
                              <User className="h-4 w-4" />
                              Portfolio
                            </Link>
                            <button
                              onClick={() => {
                                setShowDepositModal(true);
                                setShowUserMenu(false);
                              }}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-foreground hover:bg-surface transition-colors"
                            >
                              <Wallet className="h-4 w-4" />
                              Deposit / Withdraw
                            </button>
                            <button
                              onClick={() => {
                                logout();
                                setShowUserMenu(false);
                              }}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-no hover:bg-surface transition-colors"
                            >
                              <LogOut className="h-4 w-4" />
                              Log out
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/auth"
                    className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/auth"
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Deposit/Withdraw Modal */}
      <DepositWithdrawModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
      />
    </>
  );
}
