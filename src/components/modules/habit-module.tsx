'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Flame,
  Plus,
  CheckCircle2,
  Target,
  Calendar,
  TrendingUp,
  X,
  Pencil,
  Trash2,
  Sparkles,
} from 'lucide-react';
import type { Habit, HabitEntry } from '@/types';

const EMOJI_OPTIONS = [
  '✅', '🏋️', '📖', '🗣️', '🧘', '💻', '🏃', '💧', '🍎', '🎯',
  '📝', '🎨', '🎵', '🌿', '💪', '🧠', '💤', '🚶', '🌅', '☕',
  '🦷', '💊', '🧹', '📱', '💸', '❤️', '🌟', '🔥', '⏰', '🎸',
];

const COLOR_OPTIONS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e', '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4',
  '#0ea5e9', '#3b82f6', '#2563eb', '#7c3aed', '#c026d3',
];

const DAY_LABELS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

function getDayOfWeek(date: Date): number {
  const day = date.getDay();
  // Convert Sunday=0 to Monday-first: Mon=0, Tue=1, ..., Sun=6
  return day === 0 ? 6 : day - 1;
}

function dateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isWeekday(date: Date): boolean {
  const day = date.getDay();
  return day !== 0 && day !== 6;
}

function getLast28Days(): Date[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days: Date[] = [];
  // Go back 27 days (so we have 28 days total including today)
  const start = new Date(today);
  start.setDate(start.getDate() - 27);
  for (let i = 0; i < 28; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
}

function getCurrentWeekDays(): Date[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dow = getDayOfWeek(today);
  const monday = new Date(today);
  monday.setDate(today.getDate() - dow);
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
}

function calcStreak(entries: HabitEntry[], frequency: string): number {
  if (!entries || entries.length === 0) return 0;

  const sorted = [...entries]
    .filter((e) => e.completed)
    .map((e) => new Date(e.date))
    .sort((a, b) => b.getTime() - a.getTime());

  if (sorted.length === 0) return 0;

  // Deduplicate dates
  const uniqueDates = new Set<string>();
  const dates: Date[] = [];
  for (const d of sorted) {
    const key = dateKey(d);
    if (!uniqueDates.has(key)) {
      uniqueDates.add(key);
      dates.push(d);
    }
  }

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if the most recent completed date is today or yesterday
  const mostRecent = dates[0];
  const diffDays = Math.floor(
    (today.getTime() - mostRecent.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays > 1) return 0;

  let current = new Date(mostRecent);
  for (let i = 0; i < dates.length; i++) {
    const expectedKey = dateKey(current);
    const actualKey = dateKey(dates[i]);

    if (expectedKey === actualKey) {
      streak++;
      current.setDate(current.getDate() - 1);
      // For weekdays frequency, skip weekends
      if (frequency === 'weekdays') {
        const dow = current.getDay();
        if (dow === 0) {
          current.setDate(current.getDate() - 2); // Skip Sunday
        } else if (dow === 6) {
          current.setDate(current.getDate() - 1); // Skip Saturday
        }
      }
    } else {
      break;
    }
  }

  return streak;
}

export function HabitModule() {
  const { toast } = useToast();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  // Add dialog
  const [addOpen, setAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newEmoji, setNewEmoji] = useState('✅');
  const [newFrequency, setNewFrequency] = useState('daily');
  const [newColor, setNewColor] = useState('#6366f1');

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editEmoji, setEditEmoji] = useState('✅');
  const [editFrequency, setEditFrequency] = useState('daily');
  const [editColor, setEditColor] = useState('#6366f1');

  const fetchHabits = useCallback(async () => {
    try {
      const res = await fetch('/api/habits');
      if (res.ok) setHabits(await res.json());
    } catch {
      toast({ title: 'Gagal memuat kebiasaan', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const todayKey = useMemo(() => dateKey(new Date()), []);
  const weekDays = useMemo(() => getCurrentWeekDays(), []);
  const last28Days = useMemo(() => getLast28Days(), []);

  const isToday = (d: Date) => dateKey(d) === todayKey;

  const getEntryForDate = (habit: Habit, d: Date): HabitEntry | undefined => {
    if (!habit.entries) return undefined;
    const key = dateKey(d);
    return habit.entries.find((e) => dateKey(new Date(e.date)) === key);
  };

  // === Summary calculations ===
  const summaryStats = useMemo(() => {
    const totalHabits = habits.length;
    let todayCompleted = 0;
    let todayTotal = 0;
    let bestStreak = 0;
    let weekCompleted = 0;
    let weekTotal = 0;

    for (const habit of habits) {
      const streak = calcStreak(habit.entries || [], habit.frequency);
      if (streak > bestStreak) bestStreak = streak;

      // Today
      if (habit.frequency === 'daily' || (habit.frequency === 'weekdays' && isWeekday(new Date()))) {
        todayTotal++;
        const entry = getEntryForDate(habit, new Date());
        if (entry?.completed) todayCompleted++;
      }

      // This week
      for (const day of weekDays) {
        const isApplicable = habit.frequency === 'daily' || (habit.frequency === 'weekdays' && isWeekday(day));
        if (isApplicable) {
          weekTotal++;
          const entry = getEntryForDate(habit, day);
          if (entry?.completed) weekCompleted++;
        }
      }
    }

    const todayRate = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;
    const weekRate = weekTotal > 0 ? Math.round((weekCompleted / weekTotal) * 100) : 0;

    return { totalHabits, todayCompleted, todayTotal, todayRate, bestStreak, weekRate };
  }, [habits, weekDays]);

  // === Handlers ===
  const handleAddHabit = async () => {
    if (!newTitle.trim()) {
      toast({ title: 'Judul kebiasaan wajib diisi', variant: 'destructive' });
      return;
    }
    try {
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          emoji: newEmoji,
          frequency: newFrequency,
          color: newColor,
        }),
      });
      if (res.ok) {
        toast({ title: 'Kebiasaan baru ditambahkan!' });
        setNewTitle('');
        setNewEmoji('✅');
        setNewFrequency('daily');
        setNewColor('#6366f1');
        setAddOpen(false);
        fetchHabits();
      }
    } catch {
      toast({ title: 'Gagal menambahkan kebiasaan', variant: 'destructive' });
    }
  };

  const openEditDialog = (habit: Habit) => {
    setEditId(habit.id);
    setEditTitle(habit.title);
    setEditEmoji(habit.emoji);
    setEditFrequency(habit.frequency);
    setEditColor(habit.color);
    setEditOpen(true);
  };

  const handleEditHabit = async () => {
    if (!editTitle.trim()) return;
    try {
      const res = await fetch('/api/habits', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editId,
          title: editTitle.trim(),
          emoji: editEmoji,
          frequency: editFrequency,
          color: editColor,
        }),
      });
      if (res.ok) {
        toast({ title: 'Kebiasaan diperbarui!' });
        setEditOpen(false);
        fetchHabits();
      }
    } catch {
      toast({ title: 'Gagal memperbarui kebiasaan', variant: 'destructive' });
    }
  };

  const handleDeleteHabit = async (id: string) => {
    try {
      const res = await fetch(`/api/habits?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast({ title: 'Kebiasaan dihapus' });
        fetchHabits();
      }
    } catch {
      toast({ title: 'Gagal menghapus kebiasaan', variant: 'destructive' });
    }
  };

  const handleToggle = async (habitId: string, date: Date) => {
    try {
      const res = await fetch('/api/habits/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          habitId,
          date: dateKey(date),
        }),
      });
      if (res.ok) {
        const updatedEntry = await res.json();
        setHabits((prev) =>
          prev.map((h) => {
            if (h.id !== habitId) return h;
            const existing = h.entries?.find(
              (e) => dateKey(new Date(e.date)) === dateKey(date)
            );
            const newEntries = [...(h.entries || [])];
            if (existing) {
              const idx = newEntries.findIndex(
                (e) => e.id === existing.id
              );
              newEntries[idx] = { ...existing, completed: updatedEntry.completed };
            } else {
              newEntries.push({
                id: updatedEntry.id,
                date: updatedEntry.date,
                completed: updatedEntry.completed,
                habitId,
              });
            }
            return { ...h, entries: newEntries };
          })
        );
      }
    } catch {
      toast({ title: 'Gagal mengubah status', variant: 'destructive' });
    }
  };

  // === Heatmap data ===
  const heatmapData = useMemo(() => {
    // Organize 28 days into 4 weeks x 7 days
    const weeks: { date: Date; entries: HabitEntry[] }[][] = [[], [], [], []];
    for (let i = 0; i < last28Days.length; i++) {
      const weekIdx = Math.floor(i / 7);
      weeks[weekIdx].push({
        date: last28Days[i],
        entries: [],
      });
    }

    // Populate entries per cell
    for (const habit of habits) {
      for (let w = 0; w < weeks.length; w++) {
        for (let c = 0; c < weeks[w].length; c++) {
          const entry = getEntryForDate(habit, weeks[w][c].date);
          if (entry) {
            weeks[w][c].entries.push(entry);
          }
        }
      }
    }

    return weeks;
  }, [habits, last28Days]);

  const getHeatmapColor = (entries: HabitEntry[]): string => {
    if (habits.length === 0) return 'bg-muted';
    const completed = entries.filter((e) => e.completed).length;
    const pct = completed / habits.length;
    if (pct === 0) return 'bg-muted/50';
    if (pct < 0.25) return 'bg-primary/20';
    if (pct < 0.5) return 'bg-primary/40';
    if (pct < 0.75) return 'bg-primary/60';
    return 'bg-primary/80';
  };

  // === Frequency label ===
  const freqLabel = (f: string) => {
    switch (f) {
      case 'daily': return 'Setiap hari';
      case 'weekdays': return 'Hari kerja';
      case 'custom': return 'Kustom';
      default: return f;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Habit Tracker</h2>
          <p className="text-sm text-muted-foreground">
            {loading ? '...' : `${habits.length} kebiasaan dilacak`}
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4 mr-1" />
              Tambah Kebiasaan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Tambah Kebiasaan Baru</DialogTitle>
              <DialogDescription>
                Bangun kebiasaan baik untuk mencapai targetmu.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="habit-title">Judul Kebiasaan</Label>
                <Input
                  id="habit-title"
                  placeholder="e.g. Olahraga pagi 30 menit"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              {/* Emoji Picker */}
              <div className="space-y-2">
                <Label>Emoji</Label>
                <div className="grid grid-cols-10 gap-1.5 p-3 border rounded-lg">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      className={`flex size-9 items-center justify-center rounded-md text-lg transition-all hover:scale-110 ${
                        newEmoji === emoji
                          ? 'ring-2 ring-primary bg-primary/10'
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => setNewEmoji(emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Frequency */}
              <div className="space-y-2">
                <Label htmlFor="habit-freq">Frekuensi</Label>
                <Select value={newFrequency} onValueChange={setNewFrequency}>
                  <SelectTrigger id="habit-freq">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Setiap Hari</SelectItem>
                    <SelectItem value="weekdays">Hari Kerja (Sen-Jum)</SelectItem>
                    <SelectItem value="custom">Kustom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Color Picker */}
              <div className="space-y-2">
                <Label>Warna</Label>
                <div className="grid grid-cols-10 gap-1.5 p-3 border rounded-lg">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`flex size-9 items-center justify-center rounded-full transition-all hover:scale-110 ${
                        newColor === color
                          ? 'ring-2 ring-offset-2 ring-primary'
                          : 'ring-1 ring-border'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewColor(color)}
                    >
                      {newColor === color && (
                        <CheckCircle2 className="size-4 text-white" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleAddHabit}>Simpan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                <Target className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summaryStats.totalHabits}</p>
                <p className="text-xs text-muted-foreground">Total Kebiasaan</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10 shrink-0">
                <CheckCircle2 className="size-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {summaryStats.todayCompleted}/{summaryStats.todayTotal}
                </p>
                <p className="text-xs text-muted-foreground">
                  Hari ini ({summaryStats.todayRate}%)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-orange-500/10 shrink-0">
                <Flame className="size-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summaryStats.bestStreak}</p>
                <p className="text-xs text-muted-foreground">Streak Terbaik</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-violet-500/10 shrink-0">
                <TrendingUp className="size-5 text-violet-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summaryStats.weekRate}%</p>
                <p className="text-xs text-muted-foreground">Minggu Ini</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Habit List */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="size-8 rounded" />
                  <Skeleton className="h-5 w-40" />
                  <div className="flex-1 flex gap-2 justify-end">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <Skeleton key={j} className="size-8 rounded-full" />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : habits.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="flex size-16 items-center justify-center rounded-full bg-muted mb-4">
              <Sparkles className="size-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">Belum ada kebiasaan</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4 text-center max-w-sm">
              Mulai melacak kebiasaan harianmu untuk membangun disiplin dan mencapai targetmu.
            </p>
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="size-4 mr-1" />
              Buat Kebiasaan Pertama
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {/* Week header */}
          <div className="hidden md:flex items-center px-1">
            <div className="w-[180px] shrink-0" />
            <div className="flex-1 grid grid-cols-7 gap-2">
              {weekDays.map((day) => (
                <div
                  key={dateKey(day)}
                  className={`text-center text-xs font-medium ${
                    isToday(day) ? 'text-primary font-bold' : 'text-muted-foreground'
                  }`}
                >
                  {isToday(day) ? (
                    <span className="flex flex-col items-center gap-0.5">
                      <span className="size-1.5 rounded-full bg-primary" />
                      {DAY_LABELS[getDayOfWeek(day)]}
                    </span>
                  ) : (
                    DAY_LABELS[getDayOfWeek(day)]
                  )}
                </div>
              ))}
            </div>
            <div className="w-[80px] shrink-0" />
          </div>

          {habits.map((habit) => {
            const streak = calcStreak(habit.entries || [], habit.frequency);
            return (
              <Card key={habit.id} className="group transition-all hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 md:gap-4">
                    {/* Habit Info */}
                    <div className="w-[140px] md:w-[180px] shrink-0 flex items-center gap-2 min-w-0">
                      <span className="text-xl shrink-0">{habit.emoji}</span>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{habit.title}</p>
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0 h-4"
                        >
                          {freqLabel(habit.frequency)}
                        </Badge>
                      </div>
                    </div>

                    {/* 7-day grid */}
                    <div className="flex-1 grid grid-cols-7 gap-1.5 md:gap-2">
                      {weekDays.map((day) => {
                        const entry = getEntryForDate(habit, day);
                        const today = isToday(day);
                        const isApplicable =
                          habit.frequency === 'daily' ||
                          (habit.frequency === 'weekdays' && isWeekday(day));
                        const completed = entry?.completed;

                        return (
                          <button
                            key={dateKey(day)}
                            type="button"
                            disabled={!today || !isApplicable}
                            className={`flex items-center justify-center rounded-full transition-all ${
                              today
                                ? 'size-8 md:size-9 cursor-pointer hover:scale-110'
                                : 'size-7 md:size-8'
                            } ${
                              !isApplicable
                                ? 'opacity-30'
                                : completed
                                  ? 'ring-1 ring-offset-1'
                                  : 'ring-1 ring-border/50 hover:ring-border'
                            }`}
                            style={
                              completed
                                ? {
                                    backgroundColor: habit.color,
                                    ringColor: habit.color,
                                    // @ts-expect-error CSS custom property
                                    '--tw-ring-color': habit.color,
                                  }
                                : today
                                  ? { borderColor: habit.color }
                                  : undefined
                            }
                            onClick={() => {
                              if (today && isApplicable) {
                                handleToggle(habit.id, day);
                              }
                            }}
                            aria-label={`${habit.title} - ${dateKey(day)} - ${completed ? 'selesai' : 'belum'}`}
                          >
                            {completed && (
                              <svg
                                className="size-3.5 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={3}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Streak + Actions */}
                    <div className="w-[60px] md:w-[80px] shrink-0 flex items-center justify-end gap-1">
                      {streak > 0 && (
                        <Badge
                          variant="secondary"
                          className="gap-0.5 text-xs px-1.5 py-0 h-5"
                          style={{ backgroundColor: `${habit.color}15`, color: habit.color }}
                        >
                          <Flame className="size-3" />
                          {streak}
                        </Badge>
                      )}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={() => openEditDialog(habit)}
                        >
                          <Pencil className="size-3" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteHabit(habit.id)}
                        >
                          <Trash2 className="size-3" />
                          <span className="sr-only">Hapus</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Weekly Heatmap */}
      {!loading && habits.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="size-5 text-muted-foreground" />
              <CardTitle className="text-base">Peta Aktivitas 4 Minggu</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Day labels */}
              <div className="flex gap-2">
                <div className="w-8 shrink-0" />
                {heatmapData.map((week, wi) => (
                  <div key={wi} className="flex-1 grid grid-cols-7 gap-1.5">
                    {week.map((cell, di) => (
                      <div
                        key={di}
                        className="text-[10px] text-muted-foreground text-center font-medium"
                      >
                        {wi === 0 ? DAY_LABELS[getDayOfWeek(cell.date)] : ''}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Week labels + cells */}
              <div className="flex gap-2">
                <div className="w-8 shrink-0 flex flex-col gap-1.5">
                  {heatmapData.map((_, wi) => (
                    <div key={wi} className="h-7 flex items-center">
                      <span className="text-[10px] text-muted-foreground">
                        {`W${wi + 1}`}
                      </span>
                    </div>
                  ))}
                </div>
                {heatmapData.map((week, wi) => (
                  <div key={wi} className="flex-1 grid grid-cols-7 gap-1.5">
                    {week.map((cell, di) => (
                      <button
                        key={di}
                        type="button"
                        className={`size-7 rounded-md transition-all ${getHeatmapColor(cell.entries)} ${
                          isToday(cell.date) ? 'ring-2 ring-primary' : ''
                        }`}
                        title={`${dateKey(cell.date)}: ${cell.entries.filter((e) => e.completed).length}/${habits.length} selesai`}
                      >
                        {cell.entries.filter((e) => e.completed).length > 0 && (
                          <span className="text-[9px] text-white/80 font-medium">
                            {cell.entries.filter((e) => e.completed).length}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-end gap-1.5 pt-1">
                <span className="text-[10px] text-muted-foreground">Sedikit</span>
                <div className="size-3.5 rounded-sm bg-muted/50" />
                <div className="size-3.5 rounded-sm bg-primary/20" />
                <div className="size-3.5 rounded-sm bg-primary/40" />
                <div className="size-3.5 rounded-sm bg-primary/60" />
                <div className="size-3.5 rounded-sm bg-primary/80" />
                <span className="text-[10px] text-muted-foreground">Banyak</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Kebiasaan</DialogTitle>
            <DialogDescription>Perbarui detail kebiasaanmu.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-habit-title">Judul Kebiasaan</Label>
              <Input
                id="edit-habit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Emoji</Label>
              <div className="grid grid-cols-10 gap-1.5 p-3 border rounded-lg">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className={`flex size-9 items-center justify-center rounded-md text-lg transition-all hover:scale-110 ${
                      editEmoji === emoji
                        ? 'ring-2 ring-primary bg-primary/10'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => setEditEmoji(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-habit-freq">Frekuensi</Label>
              <Select value={editFrequency} onValueChange={setEditFrequency}>
                <SelectTrigger id="edit-habit-freq">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Setiap Hari</SelectItem>
                  <SelectItem value="weekdays">Hari Kerja (Sen-Jum)</SelectItem>
                  <SelectItem value="custom">Kustom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Warna</Label>
              <div className="grid grid-cols-10 gap-1.5 p-3 border rounded-lg">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`flex size-9 items-center justify-center rounded-full transition-all hover:scale-110 ${
                      editColor === color
                        ? 'ring-2 ring-offset-2 ring-primary'
                        : 'ring-1 ring-border'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setEditColor(color)}
                  >
                    {editColor === color && (
                      <CheckCircle2 className="size-4 text-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleEditHabit}>Simpan Perubahan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
