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
import { Textarea } from '@/components/ui/textarea';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  Flame,
  Clock,
  ChevronDown,
  ChevronUp,
  Layers,
  X,
} from 'lucide-react';
import type { LearningCategory, LearningItem } from '@/types';

export function LearningModule() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<LearningCategory[]>([]);
  const [items, setItems] = useState<LearningItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Add item dialog
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [newItemProgress, setNewItemProgress] = useState('0');
  const [newItemHours, setNewItemHours] = useState('0');
  const [newItemNotes, setNewItemNotes] = useState('');

  // Edit item dialog
  const [editItemOpen, setEditItemOpen] = useState(false);
  const [editItem, setEditItem] = useState<LearningItem | null>(null);
  const [editProgress, setEditProgress] = useState('');
  const [editHours, setEditHours] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Add category dialog
  const [addCatOpen, setAddCatOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#10b981');

  // Expanded notes
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, itemRes] = await Promise.all([
        fetch('/api/learning/categories'),
        fetch('/api/learning/items'),
      ]);
      if (catRes.ok) {
        const cats = await catRes.json();
        setCategories(cats);
        if (cats.length > 0 && !newItemCategory) {
          setNewItemCategory(cats[0].id);
        }
      }
      if (itemRes.ok) setItems(await itemRes.json());
    } catch {
      toast({ title: 'Failed to load learning data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredItems =
    activeCategory === 'all'
      ? items
      : items.filter((item) => item.categoryId === activeCategory);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAddItem = async () => {
    if (!newItemTitle.trim() || !newItemCategory) {
      toast({ title: 'Please fill in title and category', variant: 'destructive' });
      return;
    }
    try {
      const res = await fetch('/api/learning/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newItemTitle.trim(),
          categoryId: newItemCategory,
          progress: Number(newItemProgress) || 0,
          hoursSpent: Number(newItemHours) || 0,
          notes: newItemNotes.trim() || undefined,
        }),
      });
      if (res.ok) {
        toast({ title: 'Learning item created' });
        setNewItemTitle('');
        setNewItemProgress('0');
        setNewItemHours('0');
        setNewItemNotes('');
        setAddItemOpen(false);
        fetchData();
      }
    } catch {
      toast({ title: 'Failed to create item', variant: 'destructive' });
    }
  };

  const openEditItem = (item: LearningItem) => {
    setEditItem(item);
    setEditProgress(String(item.progress));
    setEditHours(String(item.hoursSpent));
    setEditNotes(item.notes ?? '');
    setEditItemOpen(true);
  };

  const handleEditItem = async () => {
    if (!editItem) return;
    try {
      const res = await fetch('/api/learning/items', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editItem.id,
          progress: Number(editProgress),
          hoursSpent: Number(editHours),
          notes: editNotes.trim() || undefined,
          streak: Number(editHours) > editItem.hoursSpent ? editItem.streak + 1 : editItem.streak,
          lastStudied: new Date().toISOString(),
        }),
      });
      if (res.ok) {
        toast({ title: 'Item updated' });
        setEditItemOpen(false);
        setEditItem(null);
        fetchData();
      }
    } catch {
      toast({ title: 'Failed to update item', variant: 'destructive' });
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await fetch(`/api/learning/items?id=${id}`, { method: 'DELETE' });
      toast({ title: 'Item deleted' });
      fetchData();
    } catch {
      toast({ title: 'Failed to delete item', variant: 'destructive' });
    }
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim()) {
      toast({ title: 'Please enter a category name', variant: 'destructive' });
      return;
    }
    try {
      const res = await fetch('/api/learning/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCatName.trim(), color: newCatColor }),
      });
      if (res.ok) {
        toast({ title: 'Category created' });
        setNewCatName('');
        setAddCatOpen(false);
        fetchData();
      }
    } catch {
      toast({ title: 'Failed to create category', variant: 'destructive' });
    }
  };

  const getCategoryColor = (catId: string) => {
    return categories.find((c) => c.id === catId)?.color ?? '#6366f1';
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <Dialog open={addCatOpen} onOpenChange={setAddCatOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Layers className="size-4 mr-1" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Learning Category</DialogTitle>
              <DialogDescription>Create a new category for your learning items.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="cat-name">Category Name</Label>
                <Input
                  id="cat-name"
                  placeholder="e.g., Data Science"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-color">Color</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="cat-color"
                    type="color"
                    value={newCatColor}
                    onChange={(e) => setNewCatColor(e.target.value)}
                    className="h-9 w-16 cursor-pointer p-1"
                  />
                  <div
                    className="size-9 rounded-lg border"
                    style={{ backgroundColor: newCatColor }}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddCatOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCategory}>Create Category</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={addItemOpen} onOpenChange={setAddItemOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="size-4 mr-1" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Learning Item</DialogTitle>
              <DialogDescription>Add a new skill or course to track.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="item-title">Title</Label>
                <Input
                  id="item-title"
                  placeholder="e.g., React Advanced Patterns"
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={newItemCategory} onValueChange={setNewItemCategory}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="size-2.5 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          {cat.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="item-progress">Progress (%)</Label>
                  <Input
                    id="item-progress"
                    type="number"
                    min="0"
                    max="100"
                    value={newItemProgress}
                    onChange={(e) => setNewItemProgress(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="item-hours">Hours Spent</Label>
                  <Input
                    id="item-hours"
                    type="number"
                    min="0"
                    value={newItemHours}
                    onChange={(e) => setNewItemHours(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="item-notes">Notes (optional)</Label>
                <Textarea
                  id="item-notes"
                  placeholder="Any notes..."
                  value={newItemNotes}
                  onChange={(e) => setNewItemNotes(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddItemOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddItem}>Add Item</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Category Tabs */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-9 w-64" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-2 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="flex size-16 items-center justify-center rounded-full bg-muted mb-4">
              <BookOpen className="size-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No learning categories yet</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4 text-center max-w-sm">
              Create your first category to start organizing your learning journey.
            </p>
            <Button onClick={() => setAddCatOpen(true)}>
              <Plus className="size-4 mr-1" />
              Add Category
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="all">All</TabsTrigger>
            {categories.map((cat) => (
              <TabsTrigger key={cat.id} value={cat.id}>
                <div className="flex items-center gap-1.5">
                  <div
                    className="size-2 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="hidden sm:inline">{cat.name}</span>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>

          {activeCategory === 'all' ? (
            categories.map((cat) => {
              const catItems = items.filter((item) => item.categoryId === cat.id);
              if (catItems.length === 0) return null;
              return (
                <div key={cat.id} className="space-y-4 mt-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="size-3 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <h3 className="text-sm font-semibold">{cat.name}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {catItems.length} item{catItems.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {catItems.map((item) => (
                      <LearningItemCard
                        key={item.id}
                        item={item}
                        color={cat.color}
                        expanded={expandedIds.has(item.id)}
                        onToggle={() => toggleExpand(item.id)}
                        onEdit={() => openEditItem(item)}
                        onDelete={() => handleDeleteItem(item.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <TabsContent value={activeCategory}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredItems.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center py-8">
                    <BookOpen className="size-8 text-muted-foreground/40 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No items in this category yet.
                    </p>
                  </div>
                ) : (
                  filteredItems.map((item) => {
                    const color = getCategoryColor(item.categoryId);
                    return (
                      <LearningItemCard
                        key={item.id}
                        item={item}
                        color={color}
                        expanded={expandedIds.has(item.id)}
                        onToggle={() => toggleExpand(item.id)}
                        onEdit={() => openEditItem(item)}
                        onDelete={() => handleDeleteItem(item.id)}
                      />
                    );
                  })
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      )}

      {/* Edit Item Dialog */}
      <Dialog open={editItemOpen} onOpenChange={setEditItemOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Learning Item</DialogTitle>
            <DialogDescription>Update progress, hours, and notes.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {editItem && (
              <>
                <div>
                  <p className="text-sm font-medium">{editItem.title}</p>
                  {editItem.category && (
                    <p className="text-xs text-muted-foreground">{editItem.category.name}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-progress">Progress (%)</Label>
                    <Input
                      id="edit-progress"
                      type="number"
                      min="0"
                      max="100"
                      value={editProgress}
                      onChange={(e) => setEditProgress(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-hours">Hours Spent</Label>
                    <Input
                      id="edit-hours"
                      type="number"
                      min="0"
                      value={editHours}
                      onChange={(e) => setEditHours(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-item-notes">Notes</Label>
                  <Textarea
                    id="edit-item-notes"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItemOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditItem}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LearningItemCard({
  item,
  color,
  expanded,
  onToggle,
  onEdit,
  onDelete,
}: {
  item: LearningItem;
  color: string;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="group transition-all hover:shadow-md">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium truncate">{item.title}</h4>
            {item.category && (
              <p className="text-xs text-muted-foreground mt-0.5">{item.category.name}</p>
            )}
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="size-7" onClick={onEdit}>
              <Pencil className="size-3" />
            </Button>
            <Button variant="ghost" size="icon" className="size-7" onClick={onDelete}>
              <Trash2 className="size-3" />
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{item.progress}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(item.progress, 100)}%`, backgroundColor: color }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="size-3" />
            {item.hoursSpent}h
          </span>
          <span className="flex items-center gap-1">
            <Flame className="size-3 text-orange-500" />
            {item.streak} day streak
          </span>
        </div>

        {/* Expandable notes */}
        {item.notes && (
          <div>
            <button
              onClick={onToggle}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {expanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
              {expanded ? 'Hide notes' : 'Show notes'}
            </button>
            {expanded && (
              <p className="mt-1.5 text-xs text-muted-foreground bg-muted/50 rounded-md p-2 leading-relaxed">
                {item.notes}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
