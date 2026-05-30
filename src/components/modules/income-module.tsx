'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DollarSign,
  Plus,
  TrendingUp,
  Calendar,
  Edit,
  Trash2,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Info,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/store/app-store';
import type { Currency } from '@/store/app-store';

interface IncomeEntry {
  id: string;
  date: string;
  source: string;
  category: string;
  amount: number;
  notes?: string;
}

const CATEGORIES = ['Freelance', 'Remote Job', 'Affiliate', 'Project', 'Other'];
const CATEGORY_COLORS: Record<string, string> = {
  Freelance: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  'Remote Job': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  Affiliate: 'bg-violet-500/10 text-violet-500 border-violet-500/20',
  Project: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  Other: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
};

export function IncomeModule() {
  const [entries, setEntries] = useState<IncomeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<IncomeEntry | null>(null);
  const { toast } = useToast();

  const {
    currency,
    setCurrency,
    exchangeRate,
    setExchangeRate,
    rateSource,
    setRateSource,
    formatCurrency,
    convertToDisplay,
  } = useAppStore();

  const [formCurrency, setFormCurrency] = useState<Currency>('IDR');
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    source: '',
    category: 'Freelance',
    amount: '',
    notes: '',
  });

  // Fetch exchange rate on mount
  const fetchExchangeRate = useCallback(async () => {
    try {
      const res = await fetch('/api/exchange-rate');
      if (res.ok) {
        const data = await res.json();
        setExchangeRate(data.rate);
        setRateSource(data.source);
      }
    } catch {
      // Keep existing rate
    }
  }, [setExchangeRate, setRateSource]);

  useEffect(() => {
    fetchExchangeRate();
  }, [fetchExchangeRate]);

  const fetchEntries = async () => {
    try {
      const res = await fetch('/api/income');
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to load income entries', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEntries(); }, []);

  // Set form currency to match global currency
  useEffect(() => { setFormCurrency(currency); }, [currency]);

  const resetForm = () => {
    setForm({ date: new Date().toISOString().split('T')[0], source: '', category: 'Freelance', amount: '', notes: '' });
    setEditingEntry(null);
    setFormCurrency(currency);
  };

  const openAdd = () => { resetForm(); setDialogOpen(true); };
  const openEdit = (entry: IncomeEntry) => {
    setEditingEntry(entry);
    // When editing, show the stored amount (always in USD in DB)
    // If current currency is IDR, convert to IDR for display
    const displayAmount = currency === 'IDR'
      ? (entry.amount * exchangeRate).toFixed(0)
      : entry.amount.toFixed(2);
    setForm({
      date: entry.date.split('T')[0],
      source: entry.source,
      category: entry.category,
      amount: displayAmount,
      notes: entry.notes || '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.source || !form.amount) {
      toast({ title: 'Missing fields', description: 'Source and amount are required', variant: 'destructive' });
      return;
    }
    try {
      // Convert input to USD for storage
      const inputAmount = parseFloat(form.amount);
      const usdAmount = formCurrency === 'IDR'
        ? inputAmount / exchangeRate
        : inputAmount;

      const body = {
        ...form,
        amount: usdAmount,
        ...(editingEntry ? { id: editingEntry.id } : {}),
      };
      const res = await fetch('/api/income', {
        method: editingEntry ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast({ title: editingEntry ? 'Updated' : 'Added', description: 'Income entry saved successfully' });
        setDialogOpen(false);
        resetForm();
        fetchEntries();
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to save income entry', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/income?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast({ title: 'Deleted', description: 'Income entry removed' });
        fetchEntries();
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
    }
  };

  const totalIncome = useMemo(() => entries.reduce((sum, e) => sum + e.amount, 0), [entries]);

  const monthlyIncome = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    return entries
      .filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, e) => sum + e.amount, 0);
  }, [entries]);

  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    entries.forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [entries]);

  const sortedEntries = useMemo(() =>
    [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [entries]
  );

  return (
    <div className="space-y-6">
      {/* Currency Selector + Rate Info */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                <DollarSign className="size-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Mata Uang</p>
                <p className="text-xs text-muted-foreground">Pilih mata uang untuk tampilan</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Select value={currency} onValueChange={(val) => setCurrency(val as Currency)}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IDR">🇮🇩 IDR (Rupiah)</SelectItem>
                  <SelectItem value="USD">🇺🇸 USD (Dollar)</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={fetchExchangeRate}
                title="Refresh kurs"
              >
                <RefreshCw className="size-3.5" />
              </Button>
            </div>
          </div>
          {/* Exchange Rate Info */}
          {currency === 'IDR' && (
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground bg-background/50 rounded-lg px-3 py-2">
              <Info className="size-3.5 shrink-0" />
              <span>
                <strong>1 USD = {exchangeRate.toLocaleString('id-ID')} IDR</strong>
                {' '}({rateSource})
              </span>
              <span className="text-muted-foreground/60">
                — Semua income disimpan dalam USD, dikonversi otomatis.
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-emerald-500/10">
                <Wallet className="size-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Income</p>
                <span className="text-2xl font-bold block">{loading ? <Skeleton className="h-8 w-24" /> : formatCurrency(totalIncome)}</span>
                {currency === 'IDR' && (
                  <p className="text-[10px] text-muted-foreground">${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-blue-500/10">
                <Calendar className="size-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">This Month</p>
                <span className="text-2xl font-bold block">{loading ? <Skeleton className="h-8 w-24" /> : formatCurrency(monthlyIncome)}</span>
                {currency === 'IDR' && (
                  <p className="text-[10px] text-muted-foreground">${monthlyIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-amber-500/10">
                <TrendingUp className="size-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Entries</p>
                <span className="text-2xl font-bold block">{loading ? <Skeleton className="h-8 w-16" /> : entries.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      {!loading && categoryBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Income by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categoryBreakdown.map(([cat, amount]) => (
                <div key={cat} className="flex items-center justify-between rounded-lg border p-3">
                  <Badge variant="outline" className={CATEGORY_COLORS[cat] || ''}>
                    {cat}
                  </Badge>
                  <div className="text-right">
                    <span className="font-semibold">{formatCurrency(amount)}</span>
                    {currency === 'IDR' && (
                      <p className="text-[10px] text-muted-foreground">${amount.toFixed(2)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Income Entries */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="size-5" />
              Income Entries
            </CardTitle>
            <CardDescription>Track all your earnings</CardDescription>
          </div>
          <Button onClick={openAdd} size="sm" className="gap-1">
            <Plus className="size-4" />
            Add Entry
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : sortedEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Wallet className="size-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No income entries yet.</p>
              <p className="text-sm text-muted-foreground">Start tracking your earnings here.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {sortedEntries.map(entry => (
                <div key={entry.id} className="flex items-center gap-4 rounded-lg border p-3 hover:bg-accent/50 transition-colors">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
                    {entry.category === 'Freelance' || entry.category === 'Project' ? (
                      <ArrowUpRight className="size-4 text-emerald-500" />
                    ) : (
                      <ArrowDownRight className="size-4 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{entry.source}</p>
                      <Badge variant="outline" className={`text-[10px] shrink-0 ${CATEGORY_COLORS[entry.category] || ''}`}>
                        {entry.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {entry.notes && ` · ${entry.notes}`}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-emerald-500">
                      {formatCurrency(entry.amount)}
                    </p>
                    {currency === 'IDR' && (
                      <p className="text-[10px] text-muted-foreground">${entry.amount.toFixed(2)}</p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(entry)}>
                      <Edit className="size-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => handleDelete(entry.id)}>
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEntry ? 'Edit Income Entry' : 'Add Income Entry'}</DialogTitle>
            <DialogDescription>Track your earnings and income sources.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Currency selector for input */}
            <div className="space-y-2">
              <Label>Input Currency</Label>
              <div className="flex items-center gap-2">
                <Select value={formCurrency} onValueChange={(val) => setFormCurrency(val as Currency)}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IDR">🇮🇩 IDR</SelectItem>
                    <SelectItem value="USD">🇺🇸 USD</SelectItem>
                  </SelectContent>
                </Select>
                {formCurrency === 'IDR' && (
                  <span className="text-xs text-muted-foreground">
                    Rate: 1 USD = {exchangeRate.toLocaleString('id-ID')} IDR ({rateSource})
                  </span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">
                  Amount ({formCurrency})
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step={formCurrency === 'IDR' ? '1000' : '0.01'}
                  min="0"
                  placeholder={formCurrency === 'IDR' ? '500000' : '0.00'}
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
                {formCurrency === 'IDR' && form.amount && !isNaN(parseFloat(form.amount)) && parseFloat(form.amount) > 0 && (
                  <p className="text-[10px] text-muted-foreground">
                    ≈ ${(parseFloat(form.amount) / exchangeRate).toFixed(2)} USD
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Input id="source" placeholder="e.g., Upwork Client, Fiverr" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={form.category} onValueChange={(val) => setForm({ ...form, category: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea id="notes" placeholder="Any additional details..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>Cancel</Button>
            <Button onClick={handleSave}>{editingEntry ? 'Update' : 'Add Entry'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
