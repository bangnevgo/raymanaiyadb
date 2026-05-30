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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  ClipboardCheck,
  Plus,
  Pencil,
  Trash2,
  Trophy,
  Lightbulb,
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { WeeklyReview } from '@/types';

export function ReviewsModule() {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<WeeklyReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const addDialogRef = useRef<HTMLButtonElement>(null);

  // Add form
  const [addOpen, setAddOpen] = useState(false);
  const [newWeekStart, setNewWeekStart] = useState('');
  const [newWins, setNewWins] = useState('');
  const [newLearnings, setNewLearnings] = useState('');
  const [newChallenges, setNewChallenges] = useState('');
  const [newNextGoals, setNewNextGoals] = useState('');

  // Edit form
  const [editOpen, setEditOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<WeeklyReview | null>(null);
  const [editWeekStart, setEditWeekStart] = useState('');
  const [editWins, setEditWins] = useState('');
  const [editLearnings, setEditLearnings] = useState('');
  const [editChallenges, setEditChallenges] = useState('');
  const [editNextGoals, setEditNextGoals] = useState('');

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews');
      if (res.ok) setReviews(await res.json());
    } catch {
      toast({ title: 'Failed to fetch reviews', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [toast]);

  const handleAddReview = async () => {
    if (!newWeekStart || !newWins.trim()) {
      toast({ title: 'Please fill in week start date and wins', variant: 'destructive' });
      return;
    }
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekStartDate: newWeekStart,
          wins: newWins.trim(),
          learnings: newLearnings.trim(),
          challenges: newChallenges.trim(),
          nextGoals: newNextGoals.trim(),
        }),
      });
      if (res.ok) {
        toast({ title: 'Weekly review created successfully' });
        setNewWeekStart('');
        setNewWins('');
        setNewLearnings('');
        setNewChallenges('');
        setNewNextGoals('');
        setAddOpen(false);
        fetchReviews();
      }
    } catch {
      toast({ title: 'Failed to create review', variant: 'destructive' });
    }
  };

  const openEditDialog = (review: WeeklyReview) => {
    setEditingReview(review);
    setEditWeekStart(review.weekStartDate.split('T')[0]);
    setEditWins(review.wins);
    setEditLearnings(review.learnings);
    setEditChallenges(review.challenges);
    setEditNextGoals(review.nextGoals);
    setEditOpen(true);
  };

  const handleEditReview = async () => {
    if (!editingReview || !editWeekStart || !editWins.trim()) return;
    try {
      const res = await fetch('/api/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingReview.id,
          weekStartDate: editWeekStart,
          wins: editWins.trim(),
          learnings: editLearnings.trim(),
          challenges: editChallenges.trim(),
          nextGoals: editNextGoals.trim(),
        }),
      });
      if (res.ok) {
        toast({ title: 'Review updated successfully' });
        setEditOpen(false);
        setEditingReview(null);
        fetchReviews();
      }
    } catch {
      toast({ title: 'Failed to update review', variant: 'destructive' });
    }
  };

  const handleDeleteReview = async (id: string) => {
    try {
      const res = await fetch(`/api/reviews?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast({ title: 'Review deleted' });
        setExpandedId(null);
        fetchReviews();
      }
    } catch {
      toast({ title: 'Failed to delete review', variant: 'destructive' });
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Weekly Reviews</h2>
          <p className="text-sm text-muted-foreground">
            {loading ? '...' : `${reviews.length} review${reviews.length !== 1 ? 's' : ''} recorded`}
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button ref={addDialogRef}>
              <Plus className="size-4 mr-1" />
              Add Review
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Weekly Review</DialogTitle>
              <DialogDescription>
                Reflect on your week — wins, learnings, challenges, and goals.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4 py-2 pr-3">
                <div className="space-y-2">
                  <Label htmlFor="week-start">Week Start Date</Label>
                  <Input
                    id="week-start"
                    type="date"
                    value={newWeekStart}
                    onChange={(e) => setNewWeekStart(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-wins" className="flex items-center gap-2">
                    <Trophy className="size-4 text-amber-500" />
                    Wins
                  </Label>
                  <Textarea
                    id="new-wins"
                    placeholder="Apa yang berhasil minggu ini?"
                    value={newWins}
                    onChange={(e) => setNewWins(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-learnings" className="flex items-center gap-2">
                    <Lightbulb className="size-4 text-primary" />
                    Learnings
                  </Label>
                  <Textarea
                    id="new-learnings"
                    placeholder="Apa yang dipelajari?"
                    value={newLearnings}
                    onChange={(e) => setNewLearnings(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-challenges" className="flex items-center gap-2">
                    <AlertTriangle className="size-4 text-orange-500" />
                    Challenges
                  </Label>
                  <Textarea
                    id="new-challenges"
                    placeholder="Apa hambatannya?"
                    value={newChallenges}
                    onChange={(e) => setNewChallenges(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-next-goals" className="flex items-center gap-2">
                    <ArrowRight className="size-4 text-emerald-500" />
                    Next Week Goals
                  </Label>
                  <Textarea
                    id="new-next-goals"
                    placeholder="Apa target minggu depan?"
                    value={newNextGoals}
                    onChange={(e) => setNewNextGoals(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddReview}>Save Review</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Reviews Timeline */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-5 w-48 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="flex size-16 items-center justify-center rounded-full bg-muted mb-4">
              <ClipboardCheck className="size-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No reviews yet</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4 text-center max-w-sm">
              Start reflecting on your weeks to track wins, learnings, and progress over time.
            </p>
            <Button onClick={() => addDialogRef.current?.click()}>
              <Plus className="size-4 mr-1" />
              Create Your First Review
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const isExpanded = expandedId === review.id;
            return (
              <Card key={review.id} className="group transition-all hover:shadow-md">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div
                      className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                      onClick={() => toggleExpand(review.id)}
                    >
                      <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
                        <ClipboardCheck className="size-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-medium truncate">
                          Week of {formatDate(review.weekStartDate)}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {review.wins.split('\n')[0].slice(0, 80)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => openEditDialog(review)}
                      >
                        <Pencil className="size-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteReview(review.id)}
                      >
                        <Trash2 className="size-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => toggleExpand(review.id)}
                      >
                        {isExpanded ? (
                          <ChevronUp className="size-4" />
                        ) : (
                          <ChevronDown className="size-4" />
                        )}
                        <span className="sr-only">Expand</span>
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="mt-4 space-y-4">
                      <Separator />
                      <ScrollArea className="max-h-96">
                        <div className="space-y-4 pr-3">
                          {/* Wins */}
                          <div className="flex gap-3">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 shrink-0 mt-0.5">
                              <Trophy className="size-4 text-amber-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-amber-500 mb-1">Wins</h4>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {review.wins || '—'}
                              </p>
                            </div>
                          </div>
                          {/* Learnings */}
                          <div className="flex gap-3">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 shrink-0 mt-0.5">
                              <Lightbulb className="size-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-primary mb-1">Learnings</h4>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {review.learnings || '—'}
                              </p>
                            </div>
                          </div>
                          {/* Challenges */}
                          <div className="flex gap-3">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-orange-500/10 shrink-0 mt-0.5">
                              <AlertTriangle className="size-4 text-orange-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-orange-500 mb-1">Challenges</h4>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {review.challenges || '—'}
                              </p>
                            </div>
                          </div>
                          {/* Next Goals */}
                          <div className="flex gap-3">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 shrink-0 mt-0.5">
                              <ArrowRight className="size-4 text-emerald-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-emerald-500 mb-1">Next Week Goals</h4>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {review.nextGoals || '—'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Weekly Review</DialogTitle>
            <DialogDescription>Update your weekly reflection.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 py-2 pr-3">
              <div className="space-y-2">
                <Label htmlFor="edit-week-start">Week Start Date</Label>
                <Input
                  id="edit-week-start"
                  type="date"
                  value={editWeekStart}
                  onChange={(e) => setEditWeekStart(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-wins" className="flex items-center gap-2">
                  <Trophy className="size-4 text-amber-500" />
                  Wins
                </Label>
                <Textarea
                  id="edit-wins"
                  placeholder="Apa yang berhasil minggu ini?"
                  value={editWins}
                  onChange={(e) => setEditWins(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-learnings" className="flex items-center gap-2">
                  <Lightbulb className="size-4 text-primary" />
                  Learnings
                </Label>
                <Textarea
                  id="edit-learnings"
                  placeholder="Apa yang dipelajari?"
                  value={editLearnings}
                  onChange={(e) => setEditLearnings(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-challenges" className="flex items-center gap-2">
                  <AlertTriangle className="size-4 text-orange-500" />
                  Challenges
                </Label>
                <Textarea
                  id="edit-challenges"
                  placeholder="Apa hambatannya?"
                  value={editChallenges}
                  onChange={(e) => setEditChallenges(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-next-goals" className="flex items-center gap-2">
                  <ArrowRight className="size-4 text-emerald-500" />
                  Next Week Goals
                </Label>
                <Textarea
                  id="edit-next-goals"
                  placeholder="Apa target minggu depan?"
                  value={editNextGoals}
                  onChange={(e) => setEditNextGoals(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditReview}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
