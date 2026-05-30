'use client';

import { useEffect, useState, useRef } from 'react';
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
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Target, Plus, Pencil, Trash2, Calendar } from 'lucide-react';
import type { NorthStarGoal } from '@/types';

export function GoalsModule() {
  const { toast } = useToast();
  const [goals, setGoals] = useState<NorthStarGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const addDialogRef = useRef<HTMLButtonElement>(null);
  const editDialogRef = useRef<HTMLButtonElement>(null);

  // Add form
  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [addOpen, setAddOpen] = useState(false);

  // Edit form
  const [editingGoal, setEditingGoal] = useState<NorthStarGoal | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTarget, setEditTarget] = useState('');
  const [editCurrent, setEditCurrent] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [editOpen, setEditOpen] = useState(false);

  const fetchGoals = async () => {
    try {
      const res = await fetch('/api/goals');
      if (res.ok) setGoals(await res.json());
    } catch {
      toast({ title: 'Failed to fetch goals', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [toast]);

  const getProgressColor = (pct: number) => {
    if (pct >= 75) return 'text-emerald-500';
    if (pct >= 50) return 'text-amber-500';
    if (pct >= 25) return 'text-orange-500';
    return 'text-red-500';
  };

  const getProgressBg = (pct: number) => {
    if (pct >= 75) return 'bg-emerald-500';
    if (pct >= 50) return 'bg-amber-500';
    if (pct >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getProgressTrack = (pct: number) => {
    if (pct >= 75) return 'bg-emerald-500/20';
    if (pct >= 50) return 'bg-amber-500/20';
    if (pct >= 25) return 'bg-orange-500/20';
    return 'bg-red-500/20';
  };

  const handleAddGoal = async () => {
    if (!newTitle.trim() || !newTarget.trim()) {
      toast({ title: 'Please fill in title and target', variant: 'destructive' });
      return;
    }
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          target: Number(newTarget),
          deadline: newDeadline || null,
        }),
      });
      if (res.ok) {
        toast({ title: 'Goal created successfully' });
        setNewTitle('');
        setNewTarget('');
        setNewDeadline('');
        setAddOpen(false);
        fetchGoals();
      }
    } catch {
      toast({ title: 'Failed to create goal', variant: 'destructive' });
    }
  };

  const openEditDialog = (goal: NorthStarGoal) => {
    setEditingGoal(goal);
    setEditTitle(goal.title);
    setEditTarget(String(goal.target));
    setEditCurrent(String(goal.current));
    setEditDeadline(goal.deadline ? goal.deadline.split('T')[0] : '');
    setEditOpen(true);
  };

  const handleEditGoal = async () => {
    if (!editingGoal || !editTitle.trim() || !editTarget.trim()) return;
    try {
      const res = await fetch('/api/goals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingGoal.id,
          title: editTitle.trim(),
          target: Number(editTarget),
          current: Number(editCurrent),
          deadline: editDeadline || null,
        }),
      });
      if (res.ok) {
        toast({ title: 'Goal updated successfully' });
        setEditOpen(false);
        setEditingGoal(null);
        fetchGoals();
      }
    } catch {
      toast({ title: 'Failed to update goal', variant: 'destructive' });
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      const res = await fetch(`/api/goals?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast({ title: 'Goal deleted' });
        fetchGoals();
      }
    } catch {
      toast({ title: 'Failed to delete goal', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Your Goals</h2>
          <p className="text-sm text-muted-foreground">
            {loading ? '...' : `${goals.length} goal${goals.length !== 1 ? 's' : ''} tracked`}
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button ref={addDialogRef}>
              <Plus className="size-4 mr-1" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add North Star Goal</DialogTitle>
              <DialogDescription>
                Define a long-term objective to work towards.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="goal-title">Title</Label>
                <Input
                  id="goal-title"
                  placeholder="e.g., Earn $5,000/month from remote work"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal-target">Target</Label>
                <Input
                  id="goal-target"
                  type="number"
                  placeholder="e.g., 5000"
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal-deadline">Deadline (optional)</Label>
                <Input
                  id="goal-deadline"
                  type="date"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddGoal}>Create Goal</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Goals List */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-64" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-2 w-full mt-3" />
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Skeleton className="size-8 rounded" />
                    <Skeleton className="size-8 rounded" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : goals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="flex size-16 items-center justify-center rounded-full bg-muted mb-4">
              <Target className="size-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No goals yet</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4 text-center max-w-sm">
              Add your first North Star Goal to start tracking your progress toward your dreams.
            </p>
            <Button onClick={() => addDialogRef.current?.click()}>
              <Plus className="size-4 mr-1" />
              Add Your First Goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => {
            const pct = goal.target > 0 ? Math.round((goal.current / goal.target) * 100) : 0;
            return (
              <Card key={goal.id} className="group transition-all hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium truncate">{goal.title}</h3>
                        <Badge
                          variant="outline"
                          className={`${getProgressColor(pct)} border-current/30`}
                        >
                          {pct}%
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>
                          {goal.current} / {goal.target}
                        </span>
                        {goal.deadline && (
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            {new Date(goal.deadline).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        )}
                      </div>
                      <div className="relative h-2 w-full max-w-md rounded-full overflow-hidden bg-muted mt-1">
                        <div
                          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${getProgressBg(pct)}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => openEditDialog(goal)}
                      >
                        <Pencil className="size-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteGoal(goal.id)}
                      >
                        <Trash2 className="size-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Goal</DialogTitle>
            <DialogDescription>Update your goal details and progress.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-current">Current Progress</Label>
                <Input
                  id="edit-current"
                  type="number"
                  value={editCurrent}
                  onChange={(e) => setEditCurrent(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-target">Target</Label>
                <Input
                  id="edit-target"
                  type="number"
                  value={editTarget}
                  onChange={(e) => setEditTarget(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-deadline">Deadline (optional)</Label>
              <Input
                id="edit-deadline"
                type="date"
                value={editDeadline}
                onChange={(e) => setEditDeadline(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditGoal}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
