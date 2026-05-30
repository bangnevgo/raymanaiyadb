'use client';

import { useEffect, useState } from 'react';
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
import { Slider } from '@/components/ui/slider';
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
  Award,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Calendar,
  CheckCircle2,
  Clock,
  Circle,
} from 'lucide-react';
import type { Certification } from '@/types';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  'Planned': { label: 'Planned', color: 'text-muted-foreground', bg: 'bg-muted', icon: Circle },
  'In Progress': { label: 'In Progress', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30', icon: Clock },
  'Completed': { label: 'Completed', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30', icon: CheckCircle2 },
};

export function CertificationsModule() {
  const { toast } = useToast();
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);

  // Add dialog
  const [addOpen, setAddOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const [addProvider, setAddProvider] = useState('');
  const [addStatus, setAddStatus] = useState('Planned');
  const [addStart, setAddStart] = useState('');
  const [addTarget, setAddTarget] = useState('');
  const [addPct, setAddPct] = useState(0);
  const [addUrl, setAddUrl] = useState('');

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editCert, setEditCert] = useState<Certification | null>(null);
  const [editName, setEditName] = useState('');
  const [editProvider, setEditProvider] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editStart, setEditStart] = useState('');
  const [editTarget, setEditTarget] = useState('');
  const [editPct, setEditPct] = useState(0);
  const [editUrl, setEditUrl] = useState('');

  const fetchCertifications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/certifications');
      if (res.ok) setCertifications(await res.json());
    } catch {
      toast({ title: 'Failed to fetch certifications', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertifications();
  }, [toast]);

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleAdd = async () => {
    if (!addName.trim() || !addProvider.trim()) {
      toast({ title: 'Name and provider are required', variant: 'destructive' });
      return;
    }
    try {
      const res = await fetch('/api/certifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: addName.trim(),
          provider: addProvider.trim(),
          status: addStatus,
          startDate: addStart || undefined,
          targetCompletion: addTarget || undefined,
          completionPct: addPct,
          certificateUrl: addUrl.trim() || undefined,
        }),
      });
      if (res.ok) {
        toast({ title: 'Certification added' });
        resetAddForm();
        setAddOpen(false);
        fetchCertifications();
      }
    } catch {
      toast({ title: 'Failed to add certification', variant: 'destructive' });
    }
  };

  const resetAddForm = () => {
    setAddName('');
    setAddProvider('');
    setAddStatus('Planned');
    setAddStart('');
    setAddTarget('');
    setAddPct(0);
    setAddUrl('');
  };

  const openEdit = (cert: Certification) => {
    setEditCert(cert);
    setEditName(cert.name);
    setEditProvider(cert.provider);
    setEditStatus(cert.status);
    setEditStart(cert.startDate ? cert.startDate.split('T')[0] : '');
    setEditTarget(cert.targetCompletion ? cert.targetCompletion.split('T')[0] : '');
    setEditPct(cert.completionPct);
    setEditUrl(cert.certificateUrl ?? '');
    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!editCert || !editName.trim() || !editProvider.trim()) return;
    try {
      const res = await fetch('/api/certifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editCert.id,
          name: editName.trim(),
          provider: editProvider.trim(),
          status: editStatus,
          startDate: editStart || undefined,
          targetCompletion: editTarget || undefined,
          completionPct: editPct,
          certificateUrl: editUrl.trim() || undefined,
        }),
      });
      if (res.ok) {
        toast({ title: 'Certification updated' });
        setEditOpen(false);
        setEditCert(null);
        fetchCertifications();
      }
    } catch {
      toast({ title: 'Failed to update certification', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/certifications?id=${id}`, { method: 'DELETE' });
      toast({ title: 'Certification deleted' });
      fetchCertifications();
    } catch {
      toast({ title: 'Failed to delete certification', variant: 'destructive' });
    }
  };

  const getStatusBadge = (status: string) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG['Planned'];
    const Icon = config.icon;
    return (
      <Badge
        variant="outline"
        className={`${config.color} border-current/30 gap-1`}
      >
        <Icon className="size-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Your Certifications</h2>
          <p className="text-sm text-muted-foreground">
            {loading ? '...' : `${certifications.length} certification${certifications.length !== 1 ? 's' : ''} tracked`}
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4 mr-1" />
              Add Certification
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Certification</DialogTitle>
              <DialogDescription>Track a new professional certification.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="cert-name">Certification Name</Label>
                <Input
                  id="cert-name"
                  placeholder="e.g., AWS Solutions Architect"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cert-provider">Provider</Label>
                <Input
                  id="cert-provider"
                  placeholder="e.g., Amazon Web Services"
                  value={addProvider}
                  onChange={(e) => setAddProvider(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={addStatus} onValueChange={setAddStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Planned">Planned</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cert-start">Start Date</Label>
                  <Input
                    id="cert-start"
                    type="date"
                    value={addStart}
                    onChange={(e) => setAddStart(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cert-target">Target Completion</Label>
                  <Input
                    id="cert-target"
                    type="date"
                    value={addTarget}
                    onChange={(e) => setAddTarget(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Completion: {addPct}%</Label>
                <Slider
                  value={[addPct]}
                  onValueChange={(v) => setAddPct(v[0])}
                  max={100}
                  step={5}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cert-url">Certificate URL (optional)</Label>
                <Input
                  id="cert-url"
                  placeholder="https://..."
                  value={addUrl}
                  onChange={(e) => setAddUrl(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setAddOpen(false); resetAddForm(); }}>
                Cancel
              </Button>
              <Button onClick={handleAdd}>Add Certification</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Certifications List */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-2 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : certifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="flex size-16 items-center justify-center rounded-full bg-muted mb-4">
              <Award className="size-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No certifications tracked</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4 text-center max-w-sm">
              Add a certification to start monitoring your professional development progress.
            </p>
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="size-4 mr-1" />
              Add Your First Certification
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {certifications.map((cert) => {
            const statusConfig = STATUS_CONFIG[cert.status] || STATUS_CONFIG['Planned'];
            return (
              <Card
                key={cert.id}
                className={`group transition-all hover:shadow-md ${cert.status === 'Completed' ? 'border-emerald-500/20' : ''}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium truncate">{cert.name}</h3>
                        {cert.status === 'Completed' && (
                          <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{cert.provider}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => openEdit(cert)}
                      >
                        <Pencil className="size-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(cert.id)}
                      >
                        <Trash2 className="size-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>

                  {/* Status & Progress */}
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getStatusBadge(cert.status)}
                      {cert.startDate && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="size-3" />
                          {formatDate(cert.startDate)}
                        </span>
                      )}
                    </div>

                    {/* Progress */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Completion</span>
                        <span className="font-medium">{cert.completionPct}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            cert.completionPct >= 100
                              ? 'bg-emerald-500'
                              : cert.completionPct >= 50
                                ? 'bg-amber-500'
                                : 'bg-primary'
                          }`}
                          style={{ width: `${Math.min(cert.completionPct, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Target date and certificate link */}
                    <div className="flex items-center justify-between text-xs">
                      {cert.targetCompletion && (
                        <span className="text-muted-foreground">
                          Target: {formatDate(cert.targetCompletion)}
                        </span>
                      )}
                      {cert.certificateUrl && (
                        <a
                          href={cert.certificateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary hover:underline"
                        >
                          <ExternalLink className="size-3" />
                          View Certificate
                        </a>
                      )}
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Certification</DialogTitle>
            <DialogDescription>Update certification details and progress.</DialogDescription>
          </DialogHeader>
          {editCert && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="edit-cert-name">Certification Name</Label>
                <Input
                  id="edit-cert-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-cert-provider">Provider</Label>
                <Input
                  id="edit-cert-provider"
                  value={editProvider}
                  onChange={(e) => setEditProvider(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Planned">Planned</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-cert-start">Start Date</Label>
                  <Input
                    id="edit-cert-start"
                    type="date"
                    value={editStart}
                    onChange={(e) => setEditStart(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-cert-target">Target Completion</Label>
                  <Input
                    id="edit-cert-target"
                    type="date"
                    value={editTarget}
                    onChange={(e) => setEditTarget(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Completion: {editPct}%</Label>
                <Slider
                  value={[editPct]}
                  onValueChange={(v) => setEditPct(v[0])}
                  max={100}
                  step={5}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-cert-url">Certificate URL</Label>
                <Input
                  id="edit-cert-url"
                  placeholder="https://..."
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
