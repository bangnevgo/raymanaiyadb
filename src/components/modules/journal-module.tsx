'use client';

import { useEffect, useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  PenLine,
  Pencil,
  Trash2,
  Flame,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Save,
} from 'lucide-react';
import type { JournalEntry } from '@/types';

const MOOD_OPTIONS = [
  { value: 'Great', emoji: '😄', color: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30' },
  { value: 'Good', emoji: '🙂', color: 'bg-primary/15 text-primary border-primary/30' },
  { value: 'Neutral', emoji: '😐', color: 'bg-amber-500/15 text-amber-500 border-amber-500/30' },
  { value: 'Bad', emoji: '😔', color: 'bg-orange-500/15 text-orange-500 border-orange-500/30' },
  { value: 'Terrible', emoji: '😞', color: 'bg-red-500/15 text-red-500 border-red-500/30' },
];

const getMoodConfig = (mood: string) =>
  MOOD_OPTIONS.find((m) => m.value === mood) || MOOD_OPTIONS[2];

export function JournalModule() {
  const { toast } = useToast();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Entry form
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [reflection, setReflection] = useState('');
  const [mood, setMood] = useState('Good');
  const [energyLevel, setEnergyLevel] = useState(5);
  const [saving, setSaving] = useState(false);

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [editReflection, setEditReflection] = useState('');
  const [editMood, setEditMood] = useState('Good');
  const [editEnergy, setEditEnergy] = useState(5);

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchEntries = async () => {
    try {
      const res = await fetch('/api/journal');
      if (res.ok) setEntries(await res.json());
    } catch {
      toast({ title: 'Failed to fetch journal entries', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [toast]);

  // Load entry for selected date
  useEffect(() => {
    const existing = entries.find((e) => e.date.split('T')[0] === selectedDate);
    if (existing) {
      setReflection(existing.reflection);
      setMood(existing.mood);
      setEnergyLevel(existing.energyLevel);
    } else {
      setReflection('');
      setMood('Good');
      setEnergyLevel(5);
    }
  }, [selectedDate, entries]);

  // Streak counter
  const streak = useMemo(() => {
    if (entries.length === 0) return 0;
    const sortedDates = [...entries]
      .map((e) => e.date.split('T')[0])
      .sort()
      .reverse();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    // Check if today has an entry
    let checkDate = new Date(today);
    if (!sortedDates.includes(todayStr)) {
      // Check yesterday
      checkDate.setDate(checkDate.getDate() - 1);
      const yesterdayStr = checkDate.toISOString().split('T')[0];
      if (!sortedDates.includes(yesterdayStr)) return 0;
    }

    let count = 0;
    let currentDate = sortedDates.includes(todayStr)
      ? new Date(today)
      : new Date(today.getTime() - 86400000);

    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0];
      if (sortedDates.includes(dateStr)) {
        count++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    return count;
  }, [entries]);

  const handleSave = async () => {
    setSaving(true);
    const existing = entries.find((e) => e.date.split('T')[0] === selectedDate);
    try {
      if (existing) {
        const res = await fetch('/api/journal', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: existing.id,
            reflection: reflection.trim(),
            mood,
            energyLevel,
          }),
        });
        if (res.ok) {
          toast({ title: 'Journal entry updated' });
        }
      } else {
        if (!reflection.trim()) {
          toast({ title: 'Please write a reflection', variant: 'destructive' });
          setSaving(false);
          return;
        }
        const res = await fetch('/api/journal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: selectedDate,
            reflection: reflection.trim(),
            mood,
            energyLevel,
          }),
        });
        if (res.ok) {
          toast({ title: 'Journal entry saved' });
        }
      }
      fetchEntries();
    } catch {
      toast({ title: 'Failed to save entry', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const openEditDialog = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setEditReflection(entry.reflection);
    setEditMood(entry.mood);
    setEditEnergy(entry.energyLevel);
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!editingEntry || !editReflection.trim()) return;
    try {
      const res = await fetch('/api/journal', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingEntry.id,
          reflection: editReflection.trim(),
          mood: editMood,
          energyLevel: editEnergy,
        }),
      });
      if (res.ok) {
        toast({ title: 'Entry updated successfully' });
        setEditOpen(false);
        fetchEntries();
      }
    } catch {
      toast({ title: 'Failed to update entry', variant: 'destructive' });
    }
  };

  const openDeleteDialog = (id: string) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/journal?id=${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        toast({ title: 'Entry deleted' });
        setDeleteOpen(false);
        setDeleteId(null);
        fetchEntries();
      }
    } catch {
      toast({ title: 'Failed to delete entry', variant: 'destructive' });
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const changeDate = (delta: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const getEnergyColor = (level: number) => {
    if (level >= 8) return 'bg-emerald-500';
    if (level >= 5) return 'bg-primary';
    if (level >= 3) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card className="py-4 px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
              <CalendarDays className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{entries.length}</p>
              <p className="text-xs text-muted-foreground">Total Entries</p>
            </div>
          </div>
        </Card>
        <Card className="py-4 px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-amber-500/10">
              <Flame className="size-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{streak}</p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Entry Form */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PenLine className="size-5" />
                New Entry
              </CardTitle>
              <CardDescription>Record your thoughts for the day.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date Picker */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8 shrink-0"
                  onClick={() => changeDate(-1)}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="flex-1 text-center"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8 shrink-0"
                  onClick={() => changeDate(1)}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>

              {/* Mood Selector */}
              <div className="space-y-2">
                <Label>Mood</Label>
                <div className="flex flex-wrap gap-2">
                  {MOOD_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setMood(option.value)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-all ${
                        mood === option.value
                          ? option.color
                          : 'border-border hover:border-primary/50 text-muted-foreground'
                      }`}
                    >
                      <span className="text-lg">{option.emoji}</span>
                      <span className="hidden sm:inline">{option.value}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Energy Level */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Energy Level</Label>
                  <span className="text-sm font-medium text-muted-foreground">
                    {energyLevel}/10
                  </span>
                </div>
                <Slider
                  value={[energyLevel]}
                  onValueChange={(v) => setEnergyLevel(v[0])}
                  min={1}
                  max={10}
                  step={1}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Exhausted</span>
                  <span>Energized</span>
                </div>
              </div>

              {/* Reflection */}
              <div className="space-y-2">
                <Label htmlFor="reflection">Reflection</Label>
                <Textarea
                  id="reflection"
                  placeholder="How was your day? What are you grateful for? What's on your mind?"
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  rows={5}
                />
              </div>

              <Button className="w-full" onClick={handleSave} disabled={saving}>
                <Save className="size-4 mr-1" />
                {saving ? 'Saving...' : 'Save Entry'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right: History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="size-5" />
              History
            </CardTitle>
            <CardDescription>Your past reflections.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2 p-4 rounded-lg border">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-2 w-24" />
                  </div>
                ))}
              </div>
            ) : sortedEntries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="flex size-12 items-center justify-center rounded-full bg-muted mb-3">
                  <PenLine className="size-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  No journal entries yet. Start writing your first reflection!
                </p>
              </div>
            ) : (
              <ScrollArea className="max-h-[600px]">
                <div className="space-y-3 pr-3">
                  {sortedEntries.map((entry) => {
                    const moodCfg = getMoodConfig(entry.mood);
                    return (
                      <div
                        key={entry.id}
                        className="group p-4 rounded-lg border hover:border-primary/30 transition-all"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{moodCfg.emoji}</span>
                            <div>
                              <p className="text-sm font-medium">
                                {formatDate(entry.date)}
                              </p>
                              <Badge
                                variant="outline"
                                className={`text-xs ${moodCfg.color}`}
                              >
                                {entry.mood}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7"
                              onClick={() => openEditDialog(entry)}
                            >
                              <Pencil className="size-3" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 text-destructive hover:text-destructive"
                              onClick={() => openDeleteDialog(entry.id)}
                            >
                              <Trash2 className="size-3" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </div>
                        {/* Energy Bar */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-muted-foreground w-12">Energy</span>
                          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${getEnergyColor(entry.energyLevel)}`}
                              style={{ width: `${(entry.energyLevel / 10) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-muted-foreground w-4">
                            {entry.energyLevel}
                          </span>
                        </div>
                        {/* Reflection Preview */}
                        <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">
                          {entry.reflection}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Journal Entry</DialogTitle>
            <DialogDescription>Update your reflection.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Mood</Label>
              <div className="flex flex-wrap gap-2">
                {MOOD_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setEditMood(option.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-all ${
                      editMood === option.value
                        ? option.color
                        : 'border-border hover:border-primary/50 text-muted-foreground'
                    }`}
                  >
                    <span className="text-lg">{option.emoji}</span>
                    <span>{option.value}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Energy Level</Label>
                <span className="text-sm font-medium text-muted-foreground">
                  {editEnergy}/10
                </span>
              </div>
              <Slider
                value={[editEnergy]}
                onValueChange={(v) => setEditEnergy(v[0])}
                min={1}
                max={10}
                step={1}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-reflection">Reflection</Label>
              <Textarea
                id="edit-reflection"
                value={editReflection}
                onChange={(e) => setEditReflection(e.target.value)}
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Entry</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this journal entry? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
