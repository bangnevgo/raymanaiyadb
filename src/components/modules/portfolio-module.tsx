'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { type PortfolioProject } from '@/types';
import {
  FolderGit2,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Lightbulb,
  ClipboardList,
  Hammer,
  Eye,
  Rocket,
  Package,
  Sparkles,
} from 'lucide-react';

const STATUSES = ['Idea', 'Planning', 'Building', 'Review', 'Published'] as const;
type Status = (typeof STATUSES)[number];

const STATUS_CONFIG: Record<Status, { color: string; bg: string; border: string; icon: typeof Lightbulb }> = {
  Idea: { color: 'text-slate-400', bg: 'bg-slate-500/15', border: 'border-slate-500/30', icon: Lightbulb },
  Planning: { color: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/30', icon: ClipboardList },
  Building: { color: 'text-primary', bg: 'bg-primary/15', border: 'border-primary/30', icon: Hammer },
  Review: { color: 'text-purple-400', bg: 'bg-purple-500/15', border: 'border-purple-500/30', icon: Eye },
  Published: { color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', icon: Rocket },
};

interface FormData {
  title: string;
  description: string;
  skillsUsed: string;
  aiUsed: string;
  link: string;
  status: Status;
}

const emptyForm: FormData = {
  title: '',
  description: '',
  skillsUsed: '',
  aiUsed: '',
  link: '',
  status: 'Idea',
};

function SkeletonCard() {
  return (
    <div className="rounded-lg border border-border/50 bg-card/50 p-4 space-y-3 animate-pulse">
      <div className="h-4 bg-muted rounded w-3/4" />
      <div className="h-3 bg-muted rounded w-full" />
      <div className="h-3 bg-muted rounded w-1/2" />
      <div className="flex gap-1.5">
        <div className="h-5 bg-muted rounded-full w-14" />
        <div className="h-5 bg-muted rounded-full w-16" />
      </div>
    </div>
  );
}

export function PortfolioModule() {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [selected, setSelected] = useState<PortfolioProject | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/portfolio');
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to fetch projects', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleAdd = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast({ title: 'Project added', description: `"${form.title}" has been created.` });
        setAddOpen(false);
        setForm(emptyForm);
        fetchProjects();
      } else {
        const err = await res.json();
        toast({ title: 'Error', description: err.error || 'Failed to add project', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!selected || !form.title.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/portfolio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selected.id, ...form }),
      });
      if (res.ok) {
        toast({ title: 'Project updated', description: `"${form.title}" has been saved.` });
        setEditOpen(false);
        setSelected(null);
        setForm(emptyForm);
        fetchProjects();
      } else {
        const err = await res.json();
        toast({ title: 'Error', description: err.error || 'Failed to update', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/portfolio?id=${selected.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast({ title: 'Deleted', description: `"${selected.title}" removed.` });
        setDeleteOpen(false);
        setSelected(null);
        fetchProjects();
      } else {
        toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (p: PortfolioProject) => {
    setSelected(p);
    setForm({
      title: p.title,
      description: p.description || '',
      skillsUsed: p.skillsUsed || '',
      aiUsed: p.aiUsed || '',
      link: p.link || '',
      status: p.status as Status,
    });
    setEditOpen(true);
  };

  const openView = (p: PortfolioProject) => {
    setSelected(p);
    setViewOpen(true);
  };

  const openDelete = (p: PortfolioProject) => {
    setSelected(p);
    setDeleteOpen(true);
  };

  const totalProjects = projects.length;
  const publishedProjects = projects.filter((p) => p.status === 'Published').length;
  const statusCounts = STATUSES.map((s) => ({
    status: s,
    count: projects.filter((p) => p.status === s).length,
  }));

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
        <Card className="py-4 px-4">
          <CardContent className="p-0">
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-primary/15 p-2">
                <Package className="size-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-lg font-bold">{totalProjects}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="py-4 px-4">
          <CardContent className="p-0">
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-emerald-500/15 p-2">
                <Rocket className="size-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Published</p>
                <p className="text-lg font-bold">{publishedProjects}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {statusCounts.map((sc) => {
          const cfg = STATUS_CONFIG[sc.status];
          const Icon = cfg.icon;
          return (
            <Card key={sc.status} className="py-4 px-4">
              <CardContent className="p-0">
                <div className="flex items-center gap-2">
                  <div className={`rounded-md ${cfg.bg} p-2`}>
                    <Icon className={`size-4 ${cfg.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{sc.status}</p>
                    <p className="text-lg font-bold">{sc.count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderGit2 className="size-5 text-primary" />
          <h2 className="text-lg font-semibold">Project Board</h2>
        </div>
        <Button onClick={() => { setForm(emptyForm); setAddOpen(true); }} size="sm">
          <Plus className="size-4" />
          Add Project
        </Button>
      </div>

      {/* Kanban Board - Desktop */}
      <div className="hidden md:block overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-[900px]">
          {STATUSES.map((status) => {
            const cfg = STATUS_CONFIG[status];
            const Icon = cfg.icon;
            const items = projects.filter((p) => p.status === status);
            return (
              <div
                key={status}
                className={`flex-shrink-0 w-[220px] rounded-lg border ${cfg.border} bg-muted/30`}
              >
                <div className={`flex items-center gap-2 px-4 py-3 border-b ${cfg.border}`}>
                  <Icon className={`size-4 ${cfg.color}`} />
                  <span className={`text-sm font-semibold ${cfg.color}`}>{status}</span>
                  <Badge variant="secondary" className="ml-auto text-xs">{items.length}</Badge>
                </div>
                <div className="p-3 space-y-3 min-h-[120px]">
                  {loading ? (
                    Array.from({ length: 2 }).map((_, i) => <SkeletonCard key={i} />)
                  ) : items.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-6">No projects</p>
                  ) : (
                    items.map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        config={cfg}
                        onEdit={openEdit}
                        onDelete={openDelete}
                        onView={openView}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabbed View - Mobile */}
      <div className="md:hidden">
        <Tabs defaultValue="Idea" className="w-full">
          <TabsList className="w-full overflow-x-auto">
            {STATUSES.map((status) => {
              const cfg = STATUS_CONFIG[status];
              const Icon = cfg.icon;
              return (
                <TabsTrigger key={status} value={status} className="flex items-center gap-1.5 text-xs">
                  <Icon className="size-3" />
                  {status}
                  <Badge variant="secondary" className="text-[10px] px-1 py-0">
                    {projects.filter((p) => p.status === status).length}
                  </Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>
          {STATUSES.map((status) => {
            const items = projects.filter((p) => p.status === status);
            const cfg = STATUS_CONFIG[status];
            return (
              <TabsContent key={status} value={status} className="space-y-3">
                {loading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 2 }).map((_, i) => <SkeletonCard key={i} />)}
                  </div>
                ) : items.length === 0 ? (
                  <Card className="py-8">
                    <CardContent className="p-0 text-center">
                      <p className="text-sm text-muted-foreground">No projects in {status}</p>
                    </CardContent>
                  </Card>
                ) : (
                  items.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      config={cfg}
                      onEdit={openEdit}
                      onDelete={openDelete}
                      onView={openView}
                    />
                  ))
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </div>

      {/* Add Project Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Project</DialogTitle>
            <DialogDescription>Add a new portfolio project to your board.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="add-title">Title *</Label>
              <Input
                id="add-title"
                placeholder="Project name"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-desc">Description</Label>
              <Textarea
                id="add-desc"
                placeholder="Brief description of the project..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-skills">Skills Used</Label>
              <Input
                id="add-skills"
                placeholder="React, TypeScript, Node.js"
                value={form.skillsUsed}
                onChange={(e) => setForm({ ...form, skillsUsed: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Comma-separated list</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-ai">AI Tools Used</Label>
              <Input
                id="add-ai"
                placeholder="ChatGPT, Copilot, Midjourney"
                value={form.aiUsed}
                onChange={(e) => setForm({ ...form, aiUsed: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Comma-separated list</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-link">Project Link</Label>
              <Input
                id="add-link"
                placeholder="https://..."
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v as Status })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={saving || !form.title.trim()}>
              {saving ? 'Adding...' : 'Add Project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>Update project details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-desc">Description</Label>
              <Textarea
                id="edit-desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-skills">Skills Used</Label>
              <Input
                id="edit-skills"
                placeholder="Comma-separated"
                value={form.skillsUsed}
                onChange={(e) => setForm({ ...form, skillsUsed: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-ai">AI Tools Used</Label>
              <Input
                id="edit-ai"
                placeholder="Comma-separated"
                value={form.aiUsed}
                onChange={(e) => setForm({ ...form, aiUsed: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-link">Project Link</Label>
              <Input
                id="edit-link"
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v as Status })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={saving || !form.title.trim()}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Project Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
            <DialogDescription>
              <Badge className={STATUS_CONFIG[(selected?.status as Status) || 'Idea'].bg + ' ' + STATUS_CONFIG[(selected?.status as Status) || 'Idea'].color + ' border-0'}>
                {selected?.status}
              </Badge>
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              {selected.description && (
                <>
                  <div>
                    <p className="text-sm font-medium mb-1">Description</p>
                    <p className="text-sm text-muted-foreground">{selected.description}</p>
                  </div>
                  <Separator />
                </>
              )}
              {selected.skillsUsed && (
                <div>
                  <p className="text-sm font-medium mb-2">Skills Used</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.skillsUsed.split(',').map((s, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{s.trim()}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {selected.aiUsed && (
                <div>
                  <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
                    <Sparkles className="size-3.5" /> AI Tools Used
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.aiUsed.split(',').map((a, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{a.trim()}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {selected.link && (
                <div>
                  <p className="text-sm font-medium mb-1">Project Link</p>
                  <a
                    href={selected.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    {selected.link}
                    <ExternalLink className="size-3.5" />
                  </a>
                </div>
              )}
              {selected.completionDate && (
                <div>
                  <p className="text-sm font-medium mb-1">Completed</p>
                  <p className="text-sm text-muted-foreground">{selected.completionDate}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selected?.title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
              {saving ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─── Project Card ────────────────────────────────────────────── */

function ProjectCard({
  project,
  config,
  onEdit,
  onDelete,
  onView,
}: {
  project: PortfolioProject;
  config: { color: string; bg: string; border: string; icon: typeof Lightbulb };
  onEdit: (p: PortfolioProject) => void;
  onDelete: (p: PortfolioProject) => void;
  onView: (p: PortfolioProject) => void;
}) {
  return (
    <div
      className={`group relative rounded-lg border ${config.border} ${config.bg} p-4 space-y-2 cursor-pointer transition-all hover:shadow-md`}
      onClick={() => onView(project)}
    >
      {/* Action buttons */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={(e) => { e.stopPropagation(); onEdit(project); }}
        >
          <Pencil className="size-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-destructive hover:text-destructive"
          onClick={(e) => { e.stopPropagation(); onDelete(project); }}
        >
          <Trash2 className="size-3" />
        </Button>
      </div>

      <p className={`text-sm font-semibold pr-16 ${config.color}`}>{project.title}</p>
      {project.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">
          {project.description}
        </p>
      )}
      {project.skillsUsed && (
        <div className="flex flex-wrap gap-1">
          {project.skillsUsed.split(',').slice(0, 3).map((s, i) => (
            <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0">
              {s.trim()}
            </Badge>
          ))}
          {project.skillsUsed.split(',').length > 3 && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              +{project.skillsUsed.split(',').length - 3}
            </Badge>
          )}
        </div>
      )}
      {project.aiUsed && (
        <div className="flex flex-wrap gap-1">
          {project.aiUsed.split(',').slice(0, 2).map((a, i) => (
            <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0">
              <Sparkles className="size-2.5 mr-0.5" />
              {a.trim()}
            </Badge>
          ))}
          {project.aiUsed.split(',').length > 2 && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              +{project.aiUsed.split(',').length - 2}
            </Badge>
          )}
        </div>
      )}
      {project.link && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <ExternalLink className="size-3" />
          <span className="truncate max-w-[160px]">{project.link.replace(/^https?:\/\//, '')}</span>
        </div>
      )}
    </div>
  );
}
