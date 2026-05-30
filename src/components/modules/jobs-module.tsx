'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card,
  CardContent,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { type JobApplication } from '@/types';
import { useAppStore } from '@/store/app-store';
import {
  Briefcase,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Star,
  Send,
  FileCheck,
  MessageSquare,
  Gift,
  XCircle,
  CheckCircle2,
  ArrowUpDown,
  LayoutGrid,
  LayoutList,
  TrendingUp,
  Target,
  Award,
} from 'lucide-react';

const STAGES = ['Wishlist', 'Applied', 'Assessment', 'Interview', 'Offer', 'Rejected', 'Accepted'] as const;
type Stage = (typeof STAGES)[number];

const STAGE_CONFIG: Record<Stage, { color: string; bg: string; border: string; icon: typeof Star }> = {
  Wishlist: { color: 'text-slate-400', bg: 'bg-slate-500/15', border: 'border-slate-500/30', icon: Star },
  Applied: { color: 'text-primary', bg: 'bg-primary/15', border: 'border-primary/30', icon: Send },
  Assessment: { color: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/30', icon: FileCheck },
  Interview: { color: 'text-purple-400', bg: 'bg-purple-500/15', border: 'border-purple-500/30', icon: MessageSquare },
  Offer: { color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', icon: Gift },
  Rejected: { color: 'text-red-400', bg: 'bg-red-500/15', border: 'border-red-500/30', icon: XCircle },
  Accepted: { color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30', icon: CheckCircle2 },
};

interface FormData {
  company: string;
  position: string;
  country: string;
  salaryRange: string;
  jobLink: string;
  status: Stage;
  applicationDate: string;
  notes: string;
}

const emptyForm: FormData = {
  company: '',
  position: '',
  country: '',
  salaryRange: '',
  jobLink: '',
  status: 'Wishlist',
  applicationDate: '',
  notes: '',
};

function SkeletonCard() {
  return (
    <div className="rounded-lg border border-border/50 bg-card/50 p-4 space-y-3 animate-pulse">
      <div className="h-4 bg-muted rounded w-3/4" />
      <div className="h-3 bg-muted rounded w-1/2" />
      <div className="h-3 bg-muted rounded w-2/3" />
      <div className="flex gap-2">
        <div className="h-5 bg-muted rounded-full w-16" />
        <div className="h-5 bg-muted rounded-full w-20" />
      </div>
    </div>
  );
}

export function JobsModule() {
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [selected, setSelected] = useState<JobApplication | null>(null);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'pipeline' | 'table'>('pipeline');
  const [sortCol, setSortCol] = useState<'company' | 'position' | 'status' | 'applicationDate' | 'salaryRange'>('applicationDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const { toast } = useToast();
  const { currency } = useAppStore();

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/jobs');
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to fetch jobs', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleAdd = async () => {
    if (!form.company.trim() || !form.position.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast({ title: 'Job added', description: `"${form.position}" at ${form.company}` });
        setAddOpen(false);
        setForm(emptyForm);
        fetchJobs();
      } else {
        const err = await res.json();
        toast({ title: 'Error', description: err.error || 'Failed to add', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!selected || !form.company.trim() || !form.position.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/jobs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selected.id, ...form }),
      });
      if (res.ok) {
        toast({ title: 'Updated', description: `"${form.position}" at ${form.company}` });
        setEditOpen(false);
        setSelected(null);
        setForm(emptyForm);
        fetchJobs();
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
      const res = await fetch(`/api/jobs?id=${selected.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast({ title: 'Deleted', description: `"${selected.position}" removed.` });
        setDeleteOpen(false);
        setSelected(null);
        fetchJobs();
      } else {
        toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (j: JobApplication) => {
    setSelected(j);
    setForm({
      company: j.company,
      position: j.position,
      country: j.country || '',
      salaryRange: j.salaryRange || '',
      jobLink: j.jobLink || '',
      status: j.status as Stage,
      applicationDate: j.applicationDate || '',
      notes: j.notes || '',
    });
    setEditOpen(true);
  };

  const openDelete = (j: JobApplication) => {
    setSelected(j);
    setDeleteOpen(true);
  };

  const handleStatusChange = async (job: JobApplication, newStatus: Stage) => {
    try {
      const res = await fetch('/api/jobs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: job.id, status: newStatus }),
      });
      if (res.ok) {
        toast({ title: 'Status updated', description: `${job.position} → ${newStatus}` });
        fetchJobs();
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  };

  // Metrics
  const totalApps = jobs.length;
  const interviews = jobs.filter((j) => j.status === 'Interview').length;
  const offers = jobs.filter((j) => j.status === 'Offer' || j.status === 'Accepted').length;
  const accepted = jobs.filter((j) => j.status === 'Accepted').length;
  const conversionRate = totalApps > 0 ? ((offers / totalApps) * 100).toFixed(1) : '0.0';

  // Sorted jobs for table
  const sortedJobs = useMemo(() => {
    return [...jobs].sort((a, b) => {
      let aVal = (a as Record<string, unknown>)[sortCol] as string || '';
      let bVal = (b as Record<string, unknown>)[sortCol] as string || '';
      const cmp = aVal.localeCompare(bVal);
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [jobs, sortCol, sortDir]);

  const toggleSort = (col: typeof sortCol) => {
    if (sortCol === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="py-4 px-4">
          <CardContent className="p-0">
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-primary/15 p-2">
                <Briefcase className="size-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Applications</p>
                <p className="text-lg font-bold">{totalApps}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="py-4 px-4">
          <CardContent className="p-0">
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-purple-500/15 p-2">
                <MessageSquare className="size-4 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Interviews</p>
                <p className="text-lg font-bold">{interviews}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="py-4 px-4">
          <CardContent className="p-0">
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-emerald-500/15 p-2">
                <Gift className="size-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Offers</p>
                <p className="text-lg font-bold">{offers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="py-4 px-4">
          <CardContent className="p-0">
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-green-500/15 p-2">
                <CheckCircle2 className="size-4 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Accepted</p>
                <p className="text-lg font-bold">{accepted}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="py-4 px-4 col-span-2 sm:col-span-1">
          <CardContent className="p-0">
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-amber-500/15 p-2">
                <TrendingUp className="size-4 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Conversion Rate</p>
                <p className="text-lg font-bold">{conversionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Briefcase className="size-5 text-primary" />
          <h2 className="text-lg font-semibold">Job Pipeline</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-md border border-border">
            <Button
              variant={viewMode === 'pipeline' ? 'secondary' : 'ghost'}
              size="icon"
              className="size-8 rounded-r-none"
              onClick={() => setViewMode('pipeline')}
            >
              <LayoutGrid className="size-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              size="icon"
              className="size-8 rounded-l-none"
              onClick={() => setViewMode('table')}
            >
              <LayoutList className="size-4" />
            </Button>
          </div>
          <Button onClick={() => { setForm(emptyForm); setAddOpen(true); }} size="sm">
            <Plus className="size-4" />
            Add Job
          </Button>
        </div>
      </div>

      {/* Pipeline View */}
      {viewMode === 'pipeline' && (
        <>
          {/* Desktop - Horizontal Scroll */}
          <div className="hidden md:block overflow-x-auto pb-4">
            <div className="flex gap-3 min-w-[1200px]">
              {STAGES.map((stage) => {
                const cfg = STAGE_CONFIG[stage];
                const Icon = cfg.icon;
                const items = jobs.filter((j) => j.status === stage);
                return (
                  <div
                    key={stage}
                    className={`flex-shrink-0 w-[200px] rounded-lg border ${cfg.border} bg-muted/30`}
                  >
                    <div className={`flex items-center gap-2 px-3 py-2.5 border-b ${cfg.border}`}>
                      <Icon className={`size-3.5 ${cfg.color}`} />
                      <span className={`text-sm font-semibold ${cfg.color}`}>{stage}</span>
                      <Badge variant="secondary" className="ml-auto text-xs">{items.length}</Badge>
                    </div>
                    <div className="p-2.5 space-y-2.5 min-h-[100px]">
                      {loading ? (
                        Array.from({ length: 2 }).map((_, i) => <SkeletonCard key={i} />)
                      ) : items.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-6">No jobs</p>
                      ) : (
                        items.map((job) => (
                          <JobCard
                            key={job.id}
                            job={job}
                            config={cfg}
                            onEdit={openEdit}
                            onDelete={openDelete}
                            onStatusChange={handleStatusChange}
                          />
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile - Tabs */}
          <div className="md:hidden">
            <Tabs defaultValue="Wishlist" className="w-full">
              <TabsList className="w-full overflow-x-auto">
                {STAGES.map((stage) => {
                  const cfg = STAGE_CONFIG[stage];
                  const Icon = cfg.icon;
                  return (
                    <TabsTrigger key={stage} value={stage} className="flex items-center gap-1 text-xs">
                      <Icon className="size-3" />
                      {stage}
                      <Badge variant="secondary" className="text-[10px] px-1 py-0 ml-0.5">
                        {jobs.filter((j) => j.status === stage).length}
                      </Badge>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
              {STAGES.map((stage) => {
                const items = jobs.filter((j) => j.status === stage);
                const cfg = STAGE_CONFIG[stage];
                return (
                  <TabsContent key={stage} value={stage} className="space-y-2.5">
                    {loading ? (
                      <div className="space-y-2.5">
                        {Array.from({ length: 2 }).map((_, i) => <SkeletonCard key={i} />)}
                      </div>
                    ) : items.length === 0 ? (
                      <Card className="py-8">
                        <CardContent className="p-0 text-center">
                          <p className="text-sm text-muted-foreground">No jobs in {stage}</p>
                        </CardContent>
                      </Card>
                    ) : (
                      items.map((job) => (
                        <JobCard
                          key={job.id}
                          job={job}
                          config={cfg}
                          onEdit={openEdit}
                          onDelete={openDelete}
                          onStatusChange={handleStatusChange}
                        />
                      ))
                    )}
                  </TabsContent>
                );
              })}
            </Tabs>
          </div>
        </>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => toggleSort('company')}
                >
                  <div className="flex items-center gap-1">
                    Company
                    <ArrowUpDown className="size-3" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => toggleSort('position')}
                >
                  <div className="flex items-center gap-1">
                    Position
                    <ArrowUpDown className="size-3" />
                  </div>
                </TableHead>
                <TableHead>Location</TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => toggleSort('salaryRange')}
                >
                  <div className="flex items-center gap-1">
                    Salary
                    <ArrowUpDown className="size-3" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => toggleSort('status')}
                >
                  <div className="flex items-center gap-1">
                    Status
                    <ArrowUpDown className="size-3" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => toggleSort('applicationDate')}
                >
                  <div className="flex items-center gap-1">
                    Date
                    <ArrowUpDown className="size-3" />
                  </div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><div className="h-4 bg-muted rounded w-24 animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded w-32 animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded w-16 animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded w-20 animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded w-16 animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded w-20 animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded w-16 animate-pulse ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : sortedJobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No job applications yet. Click &quot;Add Job&quot; to get started.
                  </TableCell>
                </TableRow>
              ) : (
                sortedJobs.map((job) => {
                  const cfg = STAGE_CONFIG[job.status as Stage] || STAGE_CONFIG.Wishlist;
                  return (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {job.country && <span className="text-base">{getFlagEmoji(job.country)}</span>}
                          {job.company}
                        </div>
                      </TableCell>
                      <TableCell>
                        {job.jobLink ? (
                          <a
                            href={job.jobLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            {job.position}
                            <ExternalLink className="size-3" />
                          </a>
                        ) : (
                          job.position
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{job.country || '—'}</TableCell>
                      <TableCell className="text-muted-foreground">{job.salaryRange || '—'}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.color} ${cfg.border} border`}>
                          {job.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {job.applicationDate ? new Date(job.applicationDate).toLocaleDateString() : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Select
                            value={job.status}
                            onValueChange={(v) => handleStatusChange(job, v as Stage)}
                          >
                            <SelectTrigger className="h-7 w-[100px] text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {STAGES.map((s) => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            onClick={() => openEdit(job)}
                          >
                            <Pencil className="size-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-destructive hover:text-destructive"
                            onClick={() => openDelete(job)}
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add Job Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Job Application</DialogTitle>
            <DialogDescription>Track a new job opportunity.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-company">Company *</Label>
                <Input
                  id="add-company"
                  placeholder="Company name"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-position">Position *</Label>
                <Input
                  id="add-position"
                  placeholder="Job title"
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-country">Country</Label>
                <Input
                  id="add-country"
                  placeholder="Country code (e.g., US, UK, DE)"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">ISO 2-letter code for flag emoji</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-salary">Salary Range</Label>
                <Input
                  id="add-salary"
                  placeholder={currency === 'IDR' ? 'Rp10jt–Rp20jt' : '$80k–$120k'}
                  value={form.salaryRange}
                  onChange={(e) => setForm({ ...form, salaryRange: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-link">Job Link</Label>
                <Input
                  id="add-link"
                  placeholder="https://..."
                  value={form.jobLink}
                  onChange={(e) => setForm({ ...form, jobLink: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-date">Application Date</Label>
                <Input
                  id="add-date"
                  type="date"
                  value={form.applicationDate}
                  onChange={(e) => setForm({ ...form, applicationDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v as Stage })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAGES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-notes">Notes</Label>
              <Textarea
                id="add-notes"
                placeholder="Any notes about this application..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={saving || !form.company.trim() || !form.position.trim()}>
              {saving ? 'Adding...' : 'Add Job'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Job Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Job Application</DialogTitle>
            <DialogDescription>Update job application details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-company">Company *</Label>
                <Input
                  id="edit-company"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-position">Position *</Label>
                <Input
                  id="edit-position"
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-country">Country</Label>
                <Input
                  id="edit-country"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-salary">Salary Range</Label>
                <Input
                  id="edit-salary"
                  value={form.salaryRange}
                  onChange={(e) => setForm({ ...form, salaryRange: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-link">Job Link</Label>
                <Input
                  id="edit-link"
                  value={form.jobLink}
                  onChange={(e) => setForm({ ...form, jobLink: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-date">Application Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={form.applicationDate}
                  onChange={(e) => setForm({ ...form, applicationDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v as Stage })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAGES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={saving || !form.company.trim() || !form.position.trim()}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Job Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selected?.position}&quot; at {selected?.company}? This cannot be undone.
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

/* ─── Job Card ────────────────────────────────────────────── */

function JobCard({
  job,
  config,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  job: JobApplication;
  config: { color: string; bg: string; border: string; icon: typeof Star };
  onEdit: (j: JobApplication) => void;
  onDelete: (j: JobApplication) => void;
  onStatusChange: (j: JobApplication, s: Stage) => void;
}) {
  return (
    <div
      className={`group relative rounded-lg border ${config.border} ${config.bg} p-3 space-y-2 transition-all hover:shadow-md`}
    >
      {/* Actions */}
      <div className="absolute top-2 right-2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="size-6"
          onClick={() => onEdit(job)}
        >
          <Pencil className="size-2.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-6 text-destructive hover:text-destructive"
          onClick={() => onDelete(job)}
        >
          <Trash2 className="size-2.5" />
        </Button>
      </div>

      <div className="flex items-center gap-1.5 pr-14">
        {job.country && <span className="text-sm">{getFlagEmoji(job.country)}</span>}
        <p className={`text-sm font-semibold truncate ${config.color}`}>{job.company}</p>
      </div>
      <p className="text-xs text-muted-foreground truncate">{job.position}</p>

      <div className="flex items-center gap-2 flex-wrap">
        {job.salaryRange && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            {job.salaryRange}
          </Badge>
        )}
        {job.applicationDate && (
          <span className="text-[10px] text-muted-foreground">
            {new Date(job.applicationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>

      {job.jobLink && (
        <a
          href={job.jobLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[10px] text-primary hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="size-2.5" />
          <span className="truncate max-w-[140px]">View posting</span>
        </a>
      )}

      {/* Quick status change */}
      <Select
        value={job.status}
        onValueChange={(v) => onStatusChange(job, v as Stage)}
      >
        <SelectTrigger className="h-6 text-[10px] w-full mt-1 border-border/50">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STAGES.map((s) => (
            <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/* ─── Helpers ────────────────────────────────────────────── */

function getFlagEmoji(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return '';
  const code = countryCode.toUpperCase();
  return String.fromCodePoint(
    ...code.split('').map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)
  );
}
