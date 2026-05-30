'use client';

import { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
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
  Calendar,
  Star,
  ListTodo,
  Clock,
  StickyNote,
  MessageSquare,
  Plus,
  Pencil,
  Trash2,
  Save,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import type { DailyPlan, DailyTask, DailyTimeBlock } from '@/types';

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const TIME_BLOCK_COLORS = [
  'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
  'bg-violet-500/15 border-violet-500/30 text-violet-600 dark:text-violet-400',
  'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400',
  'bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400',
  'bg-sky-500/15 border-sky-500/30 text-sky-600 dark:text-sky-400',
  'bg-teal-500/15 border-teal-500/30 text-teal-600 dark:text-teal-400',
  'bg-orange-500/15 border-orange-500/30 text-orange-600 dark:text-orange-400',
  'bg-pink-500/15 border-pink-500/30 text-pink-600 dark:text-pink-400',
];

export function DailyModule() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [plan, setPlan] = useState<DailyPlan | null>(null);
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [timeBlocks, setTimeBlocks] = useState<DailyTimeBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [priority1, setPriority1] = useState('');
  const [priority2, setPriority2] = useState('');
  const [priority3, setPriority3] = useState('');
  const [notes, setNotes] = useState('');
  const [reflection, setReflection] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Timeblock dialog
  const [tbDialogOpen, setTbDialogOpen] = useState(false);
  const [tbEditing, setTbEditing] = useState<DailyTimeBlock | null>(null);
  const [tbStart, setTbStart] = useState('');
  const [tbEnd, setTbEnd] = useState('');
  const [tbLabel, setTbLabel] = useState('');

  const fetchDay = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/daily-plan/${selectedDate}`);
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setPlan(data);
          setPriority1(data.priority1 ?? '');
          setPriority2(data.priority2 ?? '');
          setPriority3(data.priority3 ?? '');
          setNotes(data.notes ?? '');
          setReflection(data.reflection ?? '');
          setTimeBlocks(data.timeBlocks ?? []);
          setTasks(data.tasks ?? []);
        } else {
          setPlan(null);
          setPriority1('');
          setPriority2('');
          setPriority3('');
          setNotes('');
          setReflection('');
          setTimeBlocks([]);
          setTasks([]);
        }
      }
    } catch {
      toast({ title: 'Failed to load daily plan', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [selectedDate, toast]);

  useEffect(() => {
    fetchDay();
  }, [fetchDay]);

  const ensurePlan = async (): Promise<string | null> => {
    if (plan) return plan.id;
    try {
      const res = await fetch(`/api/daily-plan/${selectedDate}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority1: '', priority2: '', priority3: '' }),
      });
      if (res.ok) {
        const data = await res.json();
        setPlan(data);
        return data.id;
      }
    } catch {
      toast({ title: 'Failed to create plan', variant: 'destructive' });
    }
    return null;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const planId = await ensurePlan();
      if (!planId) {
        setSaving(false);
        return;
      }
      const res = await fetch(`/api/daily-plan/${selectedDate}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priority1: priority1.trim(),
          priority2: priority2.trim(),
          priority3: priority3.trim(),
          notes: notes.trim(),
          reflection: reflection.trim(),
        }),
      });
      if (res.ok) {
        toast({ title: 'Daily plan saved' });
      }
    } catch {
      toast({ title: 'Failed to save', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    const planId = await ensurePlan();
    if (!planId) return;
    try {
      const res = await fetch(`/api/daily-plan/${selectedDate}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTaskTitle.trim(), completed: false }),
      });
      if (res.ok) {
        setNewTaskTitle('');
        const tasksRes = await fetch(`/api/daily-plan/${selectedDate}/tasks`);
        if (tasksRes.ok) setTasks(await tasksRes.json());
      }
    } catch {
      toast({ title: 'Failed to add task', variant: 'destructive' });
    }
  };

  const handleToggleTask = async (task: DailyTask) => {
    try {
      await fetch(`/api/daily-plan/${selectedDate}/tasks`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: task.id, completed: !task.completed }),
      });
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, completed: !task.completed } : t))
      );
    } catch {
      toast({ title: 'Failed to update task', variant: 'destructive' });
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await fetch(`/api/daily-plan/${selectedDate}/tasks?id=${id}`, { method: 'DELETE' });
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch {
      toast({ title: 'Failed to delete task', variant: 'destructive' });
    }
  };

  const openTbDialog = (tb?: DailyTimeBlock) => {
    if (tb) {
      setTbEditing(tb);
      setTbStart(tb.startTime);
      setTbEnd(tb.endTime);
      setTbLabel(tb.label);
    } else {
      setTbEditing(null);
      setTbStart('');
      setTbEnd('');
      setTbLabel('');
    }
    setTbDialogOpen(true);
  };

  const handleSaveTimeBlock = async () => {
    if (!tbStart || !tbEnd || !tbLabel.trim()) {
      toast({ title: 'Please fill in all fields', variant: 'destructive' });
      return;
    }
    const planId = await ensurePlan();
    if (!planId) return;
    try {
      if (tbEditing) {
        const res = await fetch(`/api/daily-plan/${selectedDate}/timeblocks`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: tbEditing.id,
            startTime: tbStart,
            endTime: tbEnd,
            label: tbLabel.trim(),
          }),
        });
        if (res.ok) {
          const tbRes = await fetch(`/api/daily-plan/${selectedDate}/timeblocks`);
          if (tbRes.ok) setTimeBlocks(await tbRes.json());
        }
      } else {
        const res = await fetch(`/api/daily-plan/${selectedDate}/timeblocks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            startTime: tbStart,
            endTime: tbEnd,
            label: tbLabel.trim(),
          }),
        });
        if (res.ok) {
          const tbRes = await fetch(`/api/daily-plan/${selectedDate}/timeblocks`);
          if (tbRes.ok) setTimeBlocks(await tbRes.json());
        }
      }
      setTbDialogOpen(false);
      toast({ title: `Time block ${tbEditing ? 'updated' : 'created'}` });
    } catch {
      toast({ title: 'Failed to save time block', variant: 'destructive' });
    }
  };

  const handleDeleteTimeBlock = async (id: string) => {
    try {
      await fetch(`/api/daily-plan/${selectedDate}/timeblocks?id=${id}`, { method: 'DELETE' });
      setTimeBlocks((prev) => prev.filter((tb) => tb.id !== id));
      toast({ title: 'Time block deleted' });
    } catch {
      toast({ title: 'Failed to delete time block', variant: 'destructive' });
    }
  };

  const changeDate = (delta: number) => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + delta);
    setSelectedDate(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    );
  };

  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;

  return (
    <div className="space-y-6">
      {/* Date Picker */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={() => changeDate(-1)}>
          <ChevronLeft className="size-4" />
        </Button>
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-auto max-w-[180px]"
        />
        <Button variant="outline" size="icon" onClick={() => changeDate(1)}>
          <ChevronRight className="size-4" />
        </Button>
        <Button variant="secondary" onClick={() => { setSelectedDate(todayStr()); }}>
          <Calendar className="size-4 mr-1" />
          Today
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6 space-y-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Top 3 Priorities */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Star className="size-4 text-amber-500" />
                  Top 3 Priorities
                </CardTitle>
                <CardDescription>What are the most important things today?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[{ label: '1st', value: priority1, set: setPriority1 },
                  { label: '2nd', value: priority2, set: setPriority2 },
                  { label: '3rd', value: priority3, set: setPriority3 },
                ].map((p) => (
                  <div key={p.label} className="flex items-center gap-2">
                    <Badge variant="outline" className="shrink-0 text-xs w-8 justify-center">
                      {p.label}
                    </Badge>
                    <Input
                      placeholder={`Priority ${p.label}`}
                      value={p.value}
                      onChange={(e) => p.set(e.target.value)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Tasks */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ListTodo className="size-4 text-primary" />
                    Tasks
                  </CardTitle>
                  {totalTasks > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {completedTasks}/{totalTasks}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a task..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                  />
                  <Button size="icon" onClick={handleAddTask} disabled={!newTaskTitle.trim()}>
                    <Plus className="size-4" />
                  </Button>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {tasks.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No tasks yet. Add one above.
                    </p>
                  ) : (
                    tasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50 group"
                      >
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => handleToggleTask(task)}
                        />
                        <span
                          className={`flex-1 text-sm ${
                            task.completed ? 'line-through text-muted-foreground' : ''
                          }`}
                        >
                          {task.title}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Time Blocks */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Clock className="size-4 text-emerald-500" />
                    Time Blocks
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openTbDialog()}
                  >
                    <Plus className="size-3 mr-1" />
                    Add Block
                  </Button>
                </div>
                <CardDescription>Your visual schedule for the day</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-72 overflow-y-auto space-y-2">
                  {timeBlocks.length === 0 ? (
                    <div className="flex flex-col items-center py-6 text-center">
                      <Clock className="size-8 text-muted-foreground/40 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No time blocks yet. Plan your schedule.
                      </p>
                    </div>
                  ) : (
                    timeBlocks.map((tb, idx) => {
                      const colorClass = TIME_BLOCK_COLORS[idx % TIME_BLOCK_COLORS.length];
                      return (
                        <div
                          key={tb.id}
                          className={`flex items-center gap-3 rounded-lg border px-3 py-2 group transition-all hover:shadow-sm ${colorClass}`}
                        >
                          <div className="shrink-0 text-xs font-mono font-medium">
                            {tb.startTime} – {tb.endTime}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{tb.label}</p>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7"
                              onClick={() => openTbDialog(tb)}
                            >
                              <Pencil className="size-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7"
                              onClick={() => handleDeleteTimeBlock(tb.id)}
                            >
                              <Trash2 className="size-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Notes & Reflection */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageSquare className="size-4 text-violet-500" />
                  Notes & Reflection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <StickyNote className="size-3.5" />
                    Notes
                  </Label>
                  <Textarea
                    placeholder="Any notes for the day..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <MessageSquare className="size-3.5" />
                    Daily Reflection
                  </Label>
                  <Textarea
                    placeholder="How was your day? What did you learn?"
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} size="lg">
              <Save className="size-4 mr-1" />
              {saving ? 'Saving...' : 'Save Day Plan'}
            </Button>
          </div>
        </>
      )}

      {/* Time Block Dialog */}
      <Dialog open={tbDialogOpen} onOpenChange={setTbDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tbEditing ? 'Edit Time Block' : 'Add Time Block'}</DialogTitle>
            <DialogDescription>
              Define a time range and activity for your schedule.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tb-start">Start Time</Label>
                <Input
                  id="tb-start"
                  type="time"
                  value={tbStart}
                  onChange={(e) => setTbStart(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tb-end">End Time</Label>
                <Input
                  id="tb-end"
                  type="time"
                  value={tbEnd}
                  onChange={(e) => setTbEnd(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tb-label">Activity</Label>
              <Input
                id="tb-label"
                placeholder="e.g., Study Session"
                value={tbLabel}
                onChange={(e) => setTbLabel(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTbDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTimeBlock}>
              {tbEditing ? 'Save Changes' : 'Add Block'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
