'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { type NetworkingConnection } from '@/types';
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Search,
  Building2,
  Briefcase,
  Calendar,
  MessageCircle,
  X,
  Linkedin,
  Mail,
  Globe,
  UserPlus,
  Activity,
  ExternalLink,
} from 'lucide-react';

type Platform = 'LinkedIn' | 'Discord' | 'X' | 'Email' | 'Community';

const PLATFORMS: Platform[] = ['LinkedIn', 'Discord', 'X', 'Email', 'Community'];

const PLATFORM_CONFIG: Record<Platform, { color: string; bg: string; border: string; icon: typeof Linkedin }> = {
  LinkedIn: { color: 'text-blue-400', bg: 'bg-blue-500/15', border: 'border-blue-500/30', icon: Linkedin },
  Discord: { color: 'text-indigo-400', bg: 'bg-indigo-500/15', border: 'border-indigo-500/30', icon: MessageCircle },
  X: { color: 'text-foreground', bg: 'bg-foreground/10', border: 'border-foreground/20', icon: ExternalLink },
  Email: { color: 'text-slate-400', bg: 'bg-slate-500/15', border: 'border-slate-500/30', icon: Mail },
  Community: { color: 'text-green-400', bg: 'bg-green-500/15', border: 'border-green-500/30', icon: Globe },
};

interface FormData {
  name: string;
  company: string;
  role: string;
  platform: Platform;
  connectionDate: string;
  lastInteraction: string;
  notes: string;
}

const emptyForm: FormData = {
  name: '',
  company: '',
  role: '',
  platform: 'LinkedIn',
  connectionDate: '',
  lastInteraction: '',
  notes: '',
};

function SkeletonCard() {
  return (
    <div className="rounded-lg border border-border/50 bg-card/50 p-6 space-y-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-full bg-muted" />
        <div className="space-y-1.5 flex-1">
          <div className="h-4 bg-muted rounded w-32" />
          <div className="h-3 bg-muted rounded w-24" />
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="h-3 bg-muted rounded w-20" />
        <div className="h-3 bg-muted rounded w-28" />
      </div>
    </div>
  );
}

export function NetworkingModule() {
  const [connections, setConnections] = useState<NetworkingConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [selected, setSelected] = useState<NetworkingConnection | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const { toast } = useToast();

  const fetchConnections = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/networking');
      if (res.ok) {
        const data = await res.json();
        setConnections(data);
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to fetch connections', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  const handleAdd = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/networking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast({ title: 'Connection added', description: `"${form.name}" added to your network.` });
        setAddOpen(false);
        setForm(emptyForm);
        fetchConnections();
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
    if (!selected || !form.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/networking', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selected.id, ...form }),
      });
      if (res.ok) {
        toast({ title: 'Updated', description: `"${form.name}" updated.` });
        setEditOpen(false);
        setSelected(null);
        setForm(emptyForm);
        fetchConnections();
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
      const res = await fetch(`/api/networking?id=${selected.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast({ title: 'Deleted', description: `"${selected.name}" removed.` });
        setDeleteOpen(false);
        setSelected(null);
        fetchConnections();
      } else {
        toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (c: NetworkingConnection) => {
    setSelected(c);
    setForm({
      name: c.name,
      company: c.company || '',
      role: c.role || '',
      platform: c.platform as Platform,
      connectionDate: c.connectionDate || '',
      lastInteraction: c.lastInteraction || '',
      notes: c.notes || '',
    });
    setEditOpen(true);
  };

  const openDelete = (c: NetworkingConnection) => {
    setSelected(c);
    setDeleteOpen(true);
  };

  // Filter and search
  const filteredConnections = useMemo(() => {
    let result = connections;

    if (filterPlatform !== 'all') {
      result = result.filter((c) => c.platform === filterPlatform);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.company && c.company.toLowerCase().includes(q)) ||
          (c.role && c.role.toLowerCase().includes(q)) ||
          c.platform.toLowerCase().includes(q)
      );
    }

    return result;
  }, [connections, searchQuery, filterPlatform]);

  // Metrics
  const totalConnections = connections.length;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const activeConnections = connections.filter((c) => {
    if (!c.lastInteraction) return false;
    return new Date(c.lastInteraction) >= thirtyDaysAgo;
  }).length;

  // Platform breakdown
  const platformBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    connections.forEach((c) => {
      counts[c.platform] = (counts[c.platform] || 0) + 1;
    });
    return counts;
  }, [connections]);

  return (
    <div className="space-y-6">
      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="py-4 px-4">
          <CardContent className="p-0">
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-primary/15 p-2">
                <Users className="size-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Connections</p>
                <p className="text-lg font-bold">{totalConnections}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="py-4 px-4">
          <CardContent className="p-0">
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-emerald-500/15 p-2">
                <Activity className="size-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active (30d)</p>
                <p className="text-lg font-bold">{activeConnections}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {PLATFORMS.slice(0, 3).map((platform) => {
          const cfg = PLATFORM_CONFIG[platform];
          const Icon = cfg.icon;
          const count = platformBreakdown[platform] || 0;
          return (
            <Card key={platform} className="py-4 px-4">
              <CardContent className="p-0">
                <div className="flex items-center gap-2">
                  <div className={`rounded-md ${cfg.bg} p-2`}>
                    <Icon className={`size-4 ${cfg.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{platform}</p>
                    <p className="text-lg font-bold">{count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, company, role..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 size-7"
              onClick={() => setSearchQuery('')}
            >
              <X className="size-3.5" />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Select value={filterPlatform} onValueChange={setFilterPlatform}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All platforms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              {PLATFORMS.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => { setForm(emptyForm); setAddOpen(true); }} size="sm">
            <Plus className="size-4" />
            Add Connection
          </Button>
        </div>
      </div>

      {/* Connection Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filteredConnections.length === 0 ? (
        <Card className="py-16">
          <CardContent className="p-0 flex flex-col items-center gap-3">
            <div className="rounded-full bg-muted p-4">
              <UserPlus className="size-8 text-muted-foreground" />
            </div>
            {searchQuery || filterPlatform !== 'all' ? (
              <>
                <p className="text-sm text-muted-foreground">No connections match your search.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setSearchQuery(''); setFilterPlatform('all'); }}
                >
                  Clear filters
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">No connections yet.</p>
                <Button size="sm" onClick={() => { setForm(emptyForm); setAddOpen(true); }}>
                  <Plus className="size-4" />
                  Add your first connection
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredConnections.map((conn) => (
            <ConnectionCard
              key={conn.id}
              connection={conn}
              onEdit={openEdit}
              onDelete={openDelete}
            />
          ))}
        </div>
      )}

      {/* Add Connection Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Connection</DialogTitle>
            <DialogDescription>Add a new professional contact to your network.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="add-name">Name *</Label>
              <Input
                id="add-name"
                placeholder="Full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-company">Company</Label>
                <Input
                  id="add-company"
                  placeholder="Company name"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-role">Role</Label>
                <Input
                  id="add-role"
                  placeholder="Job title"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Platform</Label>
              <Select
                value={form.platform}
                onValueChange={(v) => setForm({ ...form, platform: v as Platform })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-date">Connection Date</Label>
                <Input
                  id="add-date"
                  type="date"
                  value={form.connectionDate}
                  onChange={(e) => setForm({ ...form, connectionDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-interaction">Last Interaction</Label>
                <Input
                  id="add-interaction"
                  type="date"
                  value={form.lastInteraction}
                  onChange={(e) => setForm({ ...form, lastInteraction: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-notes">Notes</Label>
              <Textarea
                id="add-notes"
                placeholder="How you met, what you discussed, follow-up reminders..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={saving || !form.name.trim()}>
              {saving ? 'Adding...' : 'Add Connection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Connection Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Connection</DialogTitle>
            <DialogDescription>Update contact details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-company">Company</Label>
                <Input
                  id="edit-company"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <Input
                  id="edit-role"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Platform</Label>
              <Select
                value={form.platform}
                onValueChange={(v) => setForm({ ...form, platform: v as Platform })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-date">Connection Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={form.connectionDate}
                  onChange={(e) => setForm({ ...form, connectionDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-interaction">Last Interaction</Label>
                <Input
                  id="edit-interaction"
                  type="date"
                  value={form.lastInteraction}
                  onChange={(e) => setForm({ ...form, lastInteraction: e.target.value })}
                />
              </div>
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
            <Button onClick={handleEdit} disabled={saving || !form.name.trim()}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Connection</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove &quot;{selected?.name}&quot; from your network?
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

/* ─── Connection Card ────────────────────────────────────── */

function ConnectionCard({
  connection,
  onEdit,
  onDelete,
}: {
  connection: NetworkingConnection;
  onEdit: (c: NetworkingConnection) => void;
  onDelete: (c: NetworkingConnection) => void;
}) {
  const platform = connection.platform as Platform;
  const cfg = PLATFORM_CONFIG[platform] || PLATFORM_CONFIG.Email;
  const Icon = cfg.icon;

  // Determine if connection is "active" (interacted in last 30 days)
  const isActive = connection.lastInteraction
    ? (Date.now() - new Date(connection.lastInteraction).getTime()) < 30 * 24 * 60 * 60 * 1000
    : false;

  // Get initials for avatar
  const initials = connection.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="group relative hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        {/* Action buttons */}
        <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => onEdit(connection)}
          >
            <Pencil className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-destructive hover:text-destructive"
            onClick={() => onDelete(connection)}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>

        {/* Header: Avatar + Name + Platform */}
        <div className="flex items-start gap-3 mb-4">
          <div className={`flex-shrink-0 flex items-center justify-center size-10 rounded-full ${cfg.bg} ${cfg.color} font-semibold text-sm`}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{connection.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Icon className="size-3" />
              <span className={`text-xs font-medium ${cfg.color}`}>{connection.platform}</span>
              {isActive && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-4">
          {connection.company && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Building2 className="size-3 flex-shrink-0" />
              <span className="truncate">{connection.company}</span>
            </div>
          )}
          {connection.role && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Briefcase className="size-3 flex-shrink-0" />
              <span className="truncate">{connection.role}</span>
            </div>
          )}
          {connection.connectionDate && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="size-3 flex-shrink-0" />
              <span>Connected {new Date(connection.connectionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          )}
          {connection.lastInteraction && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MessageCircle className="size-3 flex-shrink-0" />
              <span>
                Last contact{' '}
                {new Date(connection.lastInteraction).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          )}
        </div>

        {/* Notes preview */}
        {connection.notes && (
          <>
            <Separator className="mb-3" />
            <p className="text-xs text-muted-foreground line-clamp-2">{connection.notes}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
