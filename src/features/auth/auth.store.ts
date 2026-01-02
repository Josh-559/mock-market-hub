import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  username: string;
}

interface AuthState {
  user: User | null;
  balance: number;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, username: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  deposit: (amount: number) => void;
  withdraw: (amount: number) => boolean;
  updateBalance: (amount: number) => void;
}

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      balance: 0,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        await delay(800);

        // Mock validation
        if (!email.includes('@')) {
          set({ isLoading: false });
          return { success: false, error: 'Invalid email address' };
        }

        if (password.length < 6) {
          set({ isLoading: false });
          return { success: false, error: 'Password must be at least 6 characters' };
        }

        // Mock successful login
        const user: User = {
          id: 'user-' + Math.random().toString(36).substr(2, 9),
          email,
          username: email.split('@')[0],
        };

        set({
          user,
          balance: 10000, // Starting balance
          isAuthenticated: true,
          isLoading: false,
        });

        return { success: true };
      },

      signup: async (email, password, username) => {
        set({ isLoading: true });
        await delay(1000);

        // Mock validation
        if (!email.includes('@')) {
          set({ isLoading: false });
          return { success: false, error: 'Invalid email address' };
        }

        if (password.length < 6) {
          set({ isLoading: false });
          return { success: false, error: 'Password must be at least 6 characters' };
        }

        if (username.length < 3) {
          set({ isLoading: false });
          return { success: false, error: 'Username must be at least 3 characters' };
        }

        // Mock successful signup
        const user: User = {
          id: 'user-' + Math.random().toString(36).substr(2, 9),
          email,
          username,
        };

        set({
          user,
          balance: 10000, // Starting balance
          isAuthenticated: true,
          isLoading: false,
        });

        return { success: true };
      },

      logout: () => {
        set({
          user: null,
          balance: 0,
          isAuthenticated: false,
        });
      },

      deposit: (amount) => {
        const currentBalance = get().balance;
        set({ balance: currentBalance + amount });
      },

      withdraw: (amount) => {
        const currentBalance = get().balance;
        if (amount > currentBalance) {
          return false;
        }
        set({ balance: currentBalance - amount });
        return true;
      },

      updateBalance: (amount) => {
        set({ balance: amount });
      },
    }),
    {
      name: 'predictex-auth',
      partialize: (state) => ({
        user: state.user,
        balance: state.balance,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
