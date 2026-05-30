'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Bell, CheckCircle2, CheckCheck, Clock, AlertTriangle, Users, BookOpen, Target, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { NorthStarGoal, WeeklyReview, LearningItem, NetworkingConnection } from '@/types';

// ─── Notification type definitions ───────────────────────────────────────────

type NotificationSeverity = 'overdue' | 'warning' | 'info';

interface Notification {
  id: string;
  type: 'goal-deadline' | 'goal-overdue' | 'weekly-review' | 'stalled-learning' | 'stale-networking';
  icon: React.ElementType;
  message: string;
  severity: NotificationSeverity;
  createdAt: Date;
  read: boolean;
}

// ─── Helper: day difference ─────────────────────────────────────────────────

function daysBetween(a: Date, b: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((b.getTime() - a.getTime()) / msPerDay);
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as start
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// ─── Notification computation ────────────────────────────────────────────────

interface RawData {
  goals: NorthStarGoal[];
  reviews: WeeklyReview[];
  learningItems: LearningItem[];
  connections: NetworkingConnection[];
}

function computeNotifications(data: RawData): Notification[] {
  const now = new Date();
  const notifications: Notification[] = [];

  // 1. Goal deadlines & overdue
  for (const goal of data.goals) {
    if (!goal.deadline) continue;
    const deadline = new Date(goal.deadline);
    const days = daysBetween(now, deadline);

    if (days < 0) {
      // Overdue
      notifications.push({
        id: `goal-overdue-${goal.id}`,
        type: 'goal-overdue',
        icon: AlertTriangle,
        message: `TERLEWAT: ${goal.title} — deadline sudah lewat ${Math.abs(days)} hari`,
        severity: 'overdue',
        createdAt: new Date(deadline),
        read: false,
      });
    } else if (days <= 7) {
      // Within 7 days
      notifications.push({
        id: `goal-deadline-7-${goal.id}`,
        type: 'goal-deadline',
        icon: Clock,
        message: `Deadline: ${goal.title} — ${days === 0 ? 'hari ini!' : `${days} hari lagi`}`,
        severity: 'warning',
        createdAt: now,
        read: false,
      });
    } else if (days <= 14) {
      // Within 14 days
      notifications.push({
        id: `goal-deadline-14-${goal.id}`,
        type: 'goal-deadline',
        icon: Clock,
        message: `Deadline: ${goal.title} — ${days} hari lagi`,
        severity: 'info',
        createdAt: now,
        read: false,
      });
    }
  }

  // 2. Weekly review check — has a review been created for the current week?
  const weekStart = startOfWeek(now);
  const hasReviewThisWeek = data.reviews.some((r) => {
    const rStart = new Date(r.weekStartDate);
    return rStart.getTime() === weekStart.getTime();
  });

  if (!hasReviewThisWeek && data.reviews.length >= 0) {
    notifications.push({
      id: 'weekly-review-missing',
      type: 'weekly-review',
      icon: CheckCircle2,
      message: 'Belum ada Weekly Review minggu ini',
      severity: 'info',
      createdAt: now,
      read: false,
    });
  }

  // 3. Stalled learning streaks (streak === 0 and has lastStudied)
  for (const item of data.learningItems) {
    if (item.streak === 0) {
      let daysSince = 0;
      if (item.lastStudied) {
        daysSince = daysBetween(new Date(item.lastStudied), now);
      }
      notifications.push({
        id: `stalled-learning-${item.id}`,
        type: 'stalled-learning',
        icon: BookOpen,
        message:
          daysSince > 0
            ? `${item.title} — streak terputus, sudah ${daysSince} hari tidak belajar`
            : `${item.title} — streak terputus, mulai belajar lagi!`,
        severity: daysSince >= 14 ? 'warning' : 'info',
        createdAt: item.lastStudied ? new Date(item.lastStudied) : now,
        read: false,
      });
    }
  }

  // 4. Stale networking connections (lastInteraction 30+ days ago or never)
  for (const conn of data.connections) {
    let daysSince = 999;
    if (conn.lastInteraction) {
      daysSince = daysBetween(new Date(conn.lastInteraction), now);
    }
    if (daysSince >= 30) {
      const company = conn.company ?? 'Perusahaan tidak diketahui';
      notifications.push({
        id: `stale-networking-${conn.id}`,
        type: 'stale-networking',
        icon: Users,
        message:
          daysSince === 999
            ? `${conn.name} (${company}) — belum ada interaksi`
            : `${conn.name} (${company}) — sudah ${daysSince} hari tidak ada interaksi`,
        severity: daysSince >= 60 ? 'warning' : 'info',
        createdAt: conn.lastInteraction ? new Date(conn.lastInteraction) : now,
        read: false,
      });
    }
  }

  // Sort: overdue first, then warning, then info — newest first within same severity
  const severityOrder: Record<NotificationSeverity, number> = { overdue: 0, warning: 1, info: 2 };
  notifications.sort((a, b) => {
    const sevDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (sevDiff !== 0) return sevDiff;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  return notifications;
}

// ─── Severity color mapping ─────────────────────────────────────────────────

function severityStyles(severity: NotificationSeverity) {
  switch (severity) {
    case 'overdue':
      return {
        bg: 'bg-red-500/10',
        iconColor: 'text-red-500 dark:text-red-400',
        border: 'border-l-red-500',
        label: 'Terlewat',
        labelClass: 'bg-red-500/15 text-red-500 dark:text-red-400',
      };
    case 'warning':
      return {
        bg: 'bg-amber-500/10',
        iconColor: 'text-amber-500 dark:text-amber-400',
        border: 'border-l-amber-500',
        label: 'Peringatan',
        labelClass: 'bg-amber-500/15 text-amber-500 dark:text-amber-400',
      };
    case 'info':
      return {
        bg: 'bg-sky-500/10',
        iconColor: 'text-sky-500 dark:text-sky-400',
        border: 'border-l-sky-500',
        label: 'Info',
        labelClass: 'bg-sky-500/15 text-sky-500 dark:text-sky-400',
      };
  }
}

// ─── Single notification row ────────────────────────────────────────────────

function NotificationRow({
  notification,
  onDismiss,
}: {
  notification: Notification;
  onDismiss: (id: string) => void;
}) {
  const styles = severityStyles(notification.severity);
  const Icon = notification.icon;

  return (
    <div
      className={`relative flex items-start gap-3 rounded-lg border-l-2 ${styles.border} p-3 transition-colors hover:bg-muted/50 ${notification.read ? 'opacity-60' : ''}`}
    >
      <div className={`flex size-8 shrink-0 items-center justify-center rounded-full ${styles.bg}`}>
        <Icon className={`size-4 ${styles.iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-snug text-foreground">{notification.message}</p>
        <span className="mt-1 inline-block text-xs text-muted-foreground">
          <Badge variant="outline" className={`mr-1 text-[10px] px-1.5 py-0 ${styles.labelClass}`}>
            {styles.label}
          </Badge>
          {relativeTime(notification.createdAt)}
        </span>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDismiss(notification.id);
        }}
        className="absolute top-2 right-2 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Hapus notifikasi"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}

// ─── Relative time formatter ────────────────────────────────────────────────

function relativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'Baru saja';
  if (diffMinutes < 60) return `${diffMinutes} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 7) return `${diffDays} hari lalu`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu lalu`;
  return `${Math.floor(diffDays / 30)} bulan lalu`;
}

// ─── Main Notification Bell + Panel ─────────────────────────────────────────

export function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rawData, setRawData] = useState<RawData>({
    goals: [],
    reviews: [],
    learningItems: [],
    connections: [],
  });
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [fetchError, setFetchError] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const [goalsRes, reviewsRes, learningRes, networkingRes] = await Promise.all([
        fetch('/api/goals'),
        fetch('/api/reviews'),
        fetch('/api/learning/items'),
        fetch('/api/networking'),
      ]);

      if (!goalsRes.ok || !reviewsRes.ok || !learningRes.ok || !networkingRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [goals, reviews, learningItems, connections] = await Promise.all([
        goalsRes.json(),
        reviewsRes.json(),
        learningRes.json(),
        networkingRes.json(),
      ]);

      setRawData({ goals, reviews, learningItems, connections });
    } catch {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Compute notifications from raw data
  const allNotifications = useMemo(() => {
    return computeNotifications(rawData);
  }, [rawData]);

  // Filter out dismissed notifications and apply read state
  const visibleNotifications = useMemo(() => {
    return allNotifications
      .filter((n) => !dismissedIds.has(n.id))
      .map((n) => ({ ...n, read: readIds.has(n.id) }));
  }, [allNotifications, dismissedIds, readIds]);

  const unreadCount = visibleNotifications.filter((n) => !n.read).length;

  const markAllRead = useCallback(() => {
    const allIds = new Set(visibleNotifications.map((n) => n.id));
    setReadIds((prev) => {
      const next = new Set(prev);
      allIds.forEach((id) => next.add(id));
      return next;
    });
  }, [visibleNotifications]);

  const dismissNotification = useCallback((id: string) => {
    setDismissedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  // Group notifications by severity for the panel
  const overdueNotifications = visibleNotifications.filter((n) => n.severity === 'overdue');
  const warningNotifications = visibleNotifications.filter((n) => n.severity === 'warning');
  const infoNotifications = visibleNotifications.filter((n) => n.severity === 'info');

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative size-9"
          aria-label="Notifikasi"
        >
          <Bell className="size-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex size-4.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[400px] max-w-[calc(100vw-2rem)] p-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <Bell className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Notifikasi</h3>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {visibleNotifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                onClick={markAllRead}
              >
                <CheckCheck className="size-3.5" />
                Tandai semua dibaca
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Memuat notifikasi...</p>
          </div>
        ) : fetchError ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 px-4">
            <AlertTriangle className="size-6 text-amber-500" />
            <p className="text-sm text-muted-foreground text-center">
              Gagal memuat notifikasi
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-1"
              onClick={fetchData}
            >
              Coba lagi
            </Button>
          </div>
        ) : visibleNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 px-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <CheckCircle2 className="size-6 text-emerald-500" />
            </div>
            <p className="text-sm font-medium text-foreground">Semua aman!</p>
            <p className="text-xs text-muted-foreground text-center">
              Tidak ada notifikasi baru saat ini. Semua target dan aktivitasmu dalam kondisi baik.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[360px]">
            <div className="space-y-2 p-3">
              {/* Overdue section */}
              {overdueNotifications.length > 0 && (
                <>
                  <div className="flex items-center gap-2 px-1 pt-1 pb-1">
                    <AlertTriangle className="size-3 text-red-500" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-red-500 dark:text-red-400">
                      Terlewat
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      ({overdueNotifications.length})
                    </span>
                  </div>
                  {overdueNotifications.map((n) => (
                    <NotificationRow
                      key={n.id}
                      notification={n}
                      onDismiss={dismissNotification}
                    />
                  ))}
                </>
              )}

              {/* Warning section */}
              {warningNotifications.length > 0 && (
                <>
                  {overdueNotifications.length > 0 && <Separator className="my-1" />}
                  <div className="flex items-center gap-2 px-1 pt-1 pb-1">
                    <Clock className="size-3 text-amber-500" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-500 dark:text-amber-400">
                      Peringatan
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      ({warningNotifications.length})
                    </span>
                  </div>
                  {warningNotifications.map((n) => (
                    <NotificationRow
                      key={n.id}
                      notification={n}
                      onDismiss={dismissNotification}
                    />
                  ))}
                </>
              )}

              {/* Info section */}
              {infoNotifications.length > 0 && (
                <>
                  {(overdueNotifications.length > 0 || warningNotifications.length > 0) && (
                    <Separator className="my-1" />
                  )}
                  <div className="flex items-center gap-2 px-1 pt-1 pb-1">
                    <Target className="size-3 text-sky-500" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-500 dark:text-sky-400">
                      Info
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      ({infoNotifications.length})
                    </span>
                  </div>
                  {infoNotifications.map((n) => (
                    <NotificationRow
                      key={n.id}
                      notification={n}
                      onDismiss={dismissNotification}
                    />
                  ))}
                </>
              )}
            </div>
          </ScrollArea>
        )}

        {/* Footer */}
        {!loading && !fetchError && visibleNotifications.length > 0 && (
          <>
            <Separator />
            <div className="flex items-center justify-center border-t px-4 py-2">
              <button
                onClick={() => {
                  fetchData();
                  setDismissedIds(new Set());
                  setReadIds(new Set());
                }}
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Muat ulang notifikasi
              </button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
