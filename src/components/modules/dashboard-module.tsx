'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/app-store';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BookOpen,
  Award,
  FolderGit2,
  Briefcase,
  Users,
  DollarSign,
  Calendar,
  Target,
  Plus,
  BookOpenCheck,
  Rocket,
  ArrowRight,
  Activity,
} from 'lucide-react';
import type { DashboardSummary } from '@/types';

interface SummaryCard {
  icon: React.ElementType;
  label: string;
  value: string;
  bgClass: string;
  key: string;
}

export function DashboardModule() {
  const { setCurrentPage } = useAppStore();
  const { toast } = useToast();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentGoals, setRecentGoals] = useState<{ title: string; progress: number }[]>([]);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const [summaryRes, goalsRes] = await Promise.all([
          fetch('/api/summary'),
          fetch('/api/goals'),
        ]);
        if (summaryRes.ok) {
          const data = await summaryRes.json();
          setSummary(data);
        }
        if (goalsRes.ok) {
          const goals = await goalsRes.json();
          const topGoals = goals.slice(0, 3).map((g: { title: string; current: number; target: number }) => ({
            title: g.title,
            progress: Math.round((g.current / g.target) * 100),
          }));
          setRecentGoals(topGoals);
        }
      } catch {
        toast({ title: 'Failed to load dashboard data', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, [toast]);

  const getCards = (): SummaryCard[] => {
    if (!summary) return [];
    return [
      {
        icon: BookOpen,
        label: 'Total Learning Hours',
        value: `${summary.totalLearningHours}h`,
        bgClass: 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400',
        key: 'learning',
      },
      {
        icon: Award,
        label: 'Certifications Completed',
        value: String(summary.completedCertifications),
        bgClass: 'bg-amber-500/10 text-amber-500 dark:text-amber-400',
        key: 'certs',
      },
      {
        icon: FolderGit2,
        label: 'Portfolio Projects',
        value: String(summary.publishedProjects),
        bgClass: 'bg-violet-500/10 text-violet-500 dark:text-violet-400',
        key: 'projects',
      },
      {
        icon: Briefcase,
        label: 'Job Applications Sent',
        value: String(summary.totalApplications),
        bgClass: 'bg-rose-500/10 text-rose-500 dark:text-rose-400',
        key: 'jobs',
      },
      {
        icon: Users,
        label: 'Networking Connections',
        value: String(summary.totalConnections),
        bgClass: 'bg-sky-500/10 text-sky-500 dark:text-sky-400',
        key: 'networking',
      },
      {
        icon: DollarSign,
        label: 'Income Generated',
        value: `$${summary.totalIncome.toLocaleString()}`,
        bgClass: 'bg-teal-500/10 text-teal-500 dark:text-teal-400',
        key: 'income',
      },
    ];
  };

  const quickActions = [
    {
      label: 'Plan Today',
      description: 'Set priorities & time blocks',
      icon: Calendar,
      page: 'daily' as const,
      color: 'from-emerald-500/20 to-emerald-500/5',
      iconColor: 'text-emerald-500',
    },
    {
      label: 'Add Goal',
      description: 'Define your North Star',
      icon: Target,
      page: 'goals' as const,
      color: 'from-amber-500/20 to-amber-500/5',
      iconColor: 'text-amber-500',
    },
    {
      label: 'Start Learning',
      description: 'Track your skill growth',
      icon: BookOpenCheck,
      page: 'learning' as const,
      color: 'from-violet-500/20 to-violet-500/5',
      iconColor: 'text-violet-500',
    },
    {
      label: 'Apply for Jobs',
      description: 'Manage your pipeline',
      icon: Briefcase,
      page: 'jobs' as const,
      color: 'from-rose-500/20 to-rose-500/5',
      iconColor: 'text-rose-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="py-4">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-6 w-12" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          : getCards().map((card) => (
              <Card
                key={card.key}
                className="group relative overflow-hidden border-0 bg-gradient-to-br from-card to-card/50 py-4 transition-all duration-300 hover:border-primary/20 hover:shadow-md hover:shadow-primary/5"
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex size-10 items-center justify-center rounded-full ${card.bgClass}`}>
                      <card.icon className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs text-muted-foreground">{card.label}</p>
                      <p className="text-xl font-bold tracking-tight">{card.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="size-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>Navigate to key modules</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action) => (
              <button
                key={action.page}
                onClick={() => setCurrentPage(action.page)}
                className="flex w-full items-center gap-3 rounded-lg border bg-gradient-to-r p-3 text-left transition-all hover:border-primary/30 hover:shadow-sm"
              >
                <div className={`flex size-9 items-center justify-center rounded-lg ${action.color}`}>
                  <action.icon className={`size-4 ${action.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{action.label}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
                <ArrowRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="size-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your latest progress updates</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="size-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentGoals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-muted mb-3">
                  <Plus className="size-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No activity yet. Start by adding your North Star Goals!
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => setCurrentPage('goals')}
                >
                  <Plus className="size-4 mr-1" />
                  Add Goals
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentGoals.map((goal, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                      <Target className="size-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{goal.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="h-1.5 flex-1 max-w-[120px] rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{goal.progress}%</span>
                      </div>
                    </div>
                  </div>
                ))}
                {summary && (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-full bg-emerald-500/10">
                        <Award className="size-4 text-emerald-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {summary.completedCertifications} certifications completed
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {summary.inProgressCertifications} in progress
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-full bg-violet-500/10">
                        <FolderGit2 className="size-4 text-violet-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {summary.publishedProjects} projects published
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {summary.inProgressProjects} in progress
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-full bg-teal-500/10">
                        <DollarSign className="size-4 text-teal-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          ${summary.totalIncome.toLocaleString()} total income
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {summary.journalEntries} journal entries
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
