import { create } from 'zustand';

type Page =
  | 'dashboard' | 'goals' | 'daily' | 'learning' | 'certifications'
  | 'portfolio' | 'jobs' | 'networking' | 'income'
  | 'reviews' | 'journal' | 'analytics' | 'ai-coach' | 'habits';

type Currency = 'USD' | 'IDR';

interface CurrencyState {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  exchangeRate: number; // 1 USD = X IDR
  setExchangeRate: (rate: number) => void;
  rateSource: string;
  setRateSource: (source: string) => void;
  rateDate: string;
  setRateDate: (date: string) => void;
  convertToDisplay: (usdAmount: number) => number;
  formatCurrency: (usdAmount: number) => string;
}

interface AppState {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

interface FullState extends AppState, CurrencyState {}

export const useAppStore = create<FullState>((set, get) => ({
  // Page navigation
  currentPage: 'dashboard',
  setCurrentPage: (page) => set({ currentPage: page }),
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // Currency
  currency: 'IDR', // Default to IDR since user is Indonesian
  setCurrency: (c) => set({ currency: c }),
  exchangeRate: 16200, // Default fallback rate
  setExchangeRate: (rate) => set({ exchangeRate: rate }),
  rateSource: 'Fallback',
  setRateSource: (source) => set({ rateSource: source }),
  rateDate: new Date().toISOString().split('T')[0],
  setRateDate: (date) => set({ rateDate: date }),

  convertToDisplay: (usdAmount: number) => {
    const { currency, exchangeRate } = get();
    if (currency === 'IDR') {
      return usdAmount * exchangeRate;
    }
    return usdAmount;
  },

  formatCurrency: (usdAmount: number) => {
    const { currency, exchangeRate } = get();
    if (currency === 'IDR') {
      const idr = usdAmount * exchangeRate;
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(idr);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(usdAmount);
  },
}));

export type { Page, Currency };
