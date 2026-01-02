import { useState } from 'react';
import { X, Loader2, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { useAuthStore } from '@/features/auth/auth.store';
import { toast } from 'sonner';
import { cn } from '@/shared/utils';

interface DepositWithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'deposit' | 'withdraw';
}

export function DepositWithdrawModal({ isOpen, onClose, initialMode = 'deposit' }: DepositWithdrawModalProps) {
  const { balance, deposit, withdraw } = useAuthStore();
  const [mode, setMode] = useState<'deposit' | 'withdraw'>(initialMode);
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (mode === 'deposit') {
      deposit(numAmount);
      toast.success(`$${numAmount.toFixed(2)} deposited successfully`);
    } else {
      const success = withdraw(numAmount);
      if (success) {
        toast.success(`$${numAmount.toFixed(2)} withdrawn successfully`);
      } else {
        toast.error('Insufficient balance');
        setIsLoading(false);
        return;
      }
    }

    setIsLoading(false);
    setAmount('');
    onClose();
  };

  const quickAmounts = [100, 250, 500, 1000];

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-border rounded-xl shadow-xl z-50">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            {mode === 'deposit' ? 'Deposit Funds' : 'Withdraw Funds'}
          </h2>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setMode('deposit')}
            className={cn(
              'flex-1 py-3 text-sm font-medium text-center transition-colors border-b-2',
              mode === 'deposit'
                ? 'text-yes border-yes'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            )}
          >
            <ArrowDownToLine className="h-4 w-4 inline mr-2" />
            Deposit
          </button>
          <button
            onClick={() => setMode('withdraw')}
            className={cn(
              'flex-1 py-3 text-sm font-medium text-center transition-colors border-b-2',
              mode === 'withdraw'
                ? 'text-no border-no'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            )}
          >
            <ArrowUpFromLine className="h-4 w-4 inline mr-2" />
            Withdraw
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5">
          {/* Current Balance */}
          <div className="mb-5 p-4 rounded-lg bg-surface">
            <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
            <p className="text-2xl font-bold text-foreground">
              ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Amount Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full h-12 pl-8 pr-4 rounded-lg border border-border bg-background text-lg font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {/* Quick Amounts */}
            <div className="flex flex-wrap gap-2 mt-3">
              {quickAmounts.map((quickAmount) => (
                <button
                  key={quickAmount}
                  type="button"
                  onClick={() => setAmount(quickAmount.toString())}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors',
                    amount === quickAmount.toString()
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:text-foreground hover:bg-surface'
                  )}
                >
                  ${quickAmount}
                </button>
              ))}
              {mode === 'withdraw' && (
                <button
                  type="button"
                  onClick={() => setAmount(balance.toString())}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
                >
                  Max
                </button>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !amount}
            className={cn(
              'w-full py-3 px-4 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2',
              mode === 'deposit'
                ? 'bg-yes text-yes-foreground hover:bg-yes/90'
                : 'bg-no text-no-foreground hover:bg-no/90'
            )}
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === 'deposit' ? 'Deposit' : 'Withdraw'}
          </button>

          <p className="text-xs text-muted-foreground text-center mt-4">
            This is a demo. No real money is involved.
          </p>
        </form>
      </div>
    </>
  );
}
