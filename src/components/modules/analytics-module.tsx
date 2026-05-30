'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from 'recharts';
import {
  BarChart3,
  BookOpen,
  Award,
  FolderOpen,
  Briefcase,
  DollarSign,
  Users,
  TrendingUp,
} from 'lucide-react';
import type {
  DashboardSummary,
  LearningItem,
  Certification,
  PortfolioProject,
  JobApplication,
  NetworkingConnection,
  IncomeEntry,
} from '@/types';

const CHART_COLORS = ['#0d9488', '#f59e0b', '#8b5cf6', '#ef4444', '#3b82f6', '#ec4899', '#84cc16'];

export function AnalyticsModule() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [learningItems, setLearningItems] = useState<LearningItem[]>([]);
  const [certs, setCerts] = useState<Certification[]>([]);
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [connections, setConnections] = useState<NetworkingConnection[]>([]);
  const [income, setIncome] = useState<IncomeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, learningRes, certRes, projRes, jobsRes, connRes, incomeRes] =
          await Promise.all([
            fetch('/api/summary'),
            fetch('/api/learning/items'),
            fetch('/api/certifications'),
            fetch('/api/portfolio'),
            fetch('/api/jobs'),
            fetch('/api/networking'),
            fetch('/api/income'),
          ]);

        if (summaryRes.ok) setSummary(await summaryRes.json());
        if (learningRes.ok) setLearningItems(await learningRes.json());
        if (certRes.ok) setCerts(await certRes.json());
        if (projRes.ok) setProjects(await projRes.json());
        if (jobsRes.ok) setJobs(await jobsRes.json());
        if (connRes.ok) setConnections(await connRes.json());
        if (incomeRes.ok) setIncome(await incomeRes.json());
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Learning trend data — aggregate hours by week
  const learningTrendData = useMemo(() => {
    const weekMap = new Map<string, number>();
    learningItems.forEach((item) => {
      if (item.lastStudied) {
        const d = new Date(item.lastStudied);
        // Get Monday of the week
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(d.setDate(diff));
        const weekKey = monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        weekMap.set(weekKey, (weekMap.get(weekKey) || 0) + item.hoursSpent);
      }
    });
    return Array.from(weekMap.entries())
      .map(([week, hours]) => ({ week, hours }))
      .slice(-12);
  }, [learningItems]);

  // Project status distribution
  const projectStatusData = useMemo(() => {
    const statusMap = new Map<string, number>();
    const statusLabels: Record<string, string> = {
      Idea: 'Idea',
      Planning: 'Planning',
      Building: 'Building',
      Review: 'Review',
      Published: 'Published',
    };
    projects.forEach((p) => {
      const label = statusLabels[p.status] || p.status;
      statusMap.set(label, (statusMap.get(label) || 0) + 1);
    });
    return Array.from(statusMap.entries()).map(([name, value]) => ({ name, value }));
  }, [projects]);

  // Certification progress
  const certProgressData = useMemo(() => {
    return certs
      .slice(0, 8)
      .map((c) => ({
        name: c.name.length > 20 ? c.name.slice(0, 20) + '…' : c.name,
        completion: Math.min(c.completionPct, 100),
      }));
  }, [certs]);

  // Job application funnel
  const jobFunnelData = useMemo(() => {
    const stages = ['Wishlist', 'Applied', 'Assessment', 'Interview', 'Offer', 'Accepted', 'Rejected'];
    return stages
      .map((stage) => ({
        stage,
        count: jobs.filter((j) => j.status === stage).length,
      }))
      .filter((s) => s.count > 0);
  }, [jobs]);

  // Income trend — monthly
  const incomeTrendData = useMemo(() => {
    const monthMap = new Map<string, number>();
    income.forEach((entry) => {
      const d = new Date(entry.date);
      const monthKey = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + entry.amount);
    });
    return Array.from(monthMap.entries())
      .map(([month, amount]) => ({ month, amount }))
      .slice(-12);
  }, [income]);

  // Networking growth — cumulative
  const networkingGrowthData = useMemo(() => {
    const sorted = [...connections]
      .filter((c) => c.connectionDate)
      .sort((a, b) => new Date(a.connectionDate!).getTime() - new Date(b.connectionDate!).getTime());
    let cumulative = 0;
    return sorted.map((c) => {
      cumulative++;
      return {
        date: new Date(c.connectionDate!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        connections: cumulative,
      };
    });
  }, [connections]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const summaryCards = [
    {
      title: 'Learning Hours',
      value: summary?.totalLearningHours ?? 0,
      icon: BookOpen,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      title: 'Certifications',
      value: summary?.certificationsCompleted ?? 0,
      icon: Award,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      title: 'Projects',
      value: summary?.projectsCompleted ?? 0,
      icon: FolderOpen,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
    {
      title: 'Applications',
      value: summary?.applicationsSent ?? 0,
      icon: Briefcase,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
    },
    {
      title: 'Income',
      value: formatCurrency(summary?.incomeGenerated ?? 0),
      icon: DollarSign,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      title: 'Connections',
      value: summary?.connections ?? 0,
      icon: Users,
      color: 'text-pink-500',
      bg: 'bg-pink-500/10',
    },
  ];

  const hasData = learningItems.length > 0 || projects.length > 0 || jobs.length > 0 || income.length > 0 || connections.length > 0 || certs.length > 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="py-4 px-6">
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-24" />
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-36" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {summaryCards.map((card) => (
          <Card key={card.title} className="py-4 px-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className={`flex size-10 items-center justify-center rounded-full ${card.bg} shrink-0`}>
                <card.icon className={`size-5 ${card.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-bold truncate">{card.value}</p>
                <p className="text-xs text-muted-foreground truncate">{card.title}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Learning Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="size-5 text-primary" />
              Learning Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {learningTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={learningTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="week" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 8,
                      color: 'hsl(var(--popover-foreground))',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="hours"
                    stroke={CHART_COLORS[0]}
                    strokeWidth={2}
                    dot={{ fill: CHART_COLORS[0], r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Hours"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartPlaceholder message="Add learning items to see your study trend." />
            )}
          </CardContent>
        </Card>

        {/* Project Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FolderOpen className="size-5 text-purple-500" />
              Project Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {projectStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={projectStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                  >
                    {projectStatusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 8,
                      color: 'hsl(var(--popover-foreground))',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartPlaceholder message="Add portfolio projects to see their status distribution." />
            )}
          </CardContent>
        </Card>

        {/* Certification Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Award className="size-5 text-amber-500" />
              Certification Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            {certProgressData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={certProgressData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={100}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, 'Completion']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 8,
                      color: 'hsl(var(--popover-foreground))',
                    }}
                  />
                  <Bar dataKey="completion" radius={[0, 4, 4, 0]}>
                    {certProgressData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartPlaceholder message="Add certifications to track your progress." />
            )}
          </CardContent>
        </Card>

        {/* Job Application Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Briefcase className="size-5 text-red-500" />
              Job Application Funnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            {jobFunnelData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={jobFunnelData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis
                    type="number"
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="stage"
                    width={90}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 8,
                      color: 'hsl(var(--popover-foreground))',
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {jobFunnelData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartPlaceholder message="Add job applications to see your funnel." />
            )}
          </CardContent>
        </Card>

        {/* Income Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSign className="size-5 text-emerald-500" />
              Income Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {incomeTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={incomeTrendData}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS[4]} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={CHART_COLORS[4]} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'Income']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 8,
                      color: 'hsl(var(--popover-foreground))',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke={CHART_COLORS[4]}
                    strokeWidth={2}
                    fill="url(#incomeGrad)"
                    name="Income"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartPlaceholder message="Add income entries to see your earnings trend." />
            )}
          </CardContent>
        </Card>

        {/* Networking Growth */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="size-5 text-pink-500" />
              Networking Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            {networkingGrowthData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={networkingGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <YAxis
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 8,
                      color: 'hsl(var(--popover-foreground))',
                    }}
                  />
                  <Line
                    type="stepAfter"
                    dataKey="connections"
                    stroke={CHART_COLORS[5]}
                    strokeWidth={2}
                    dot={{ fill: CHART_COLORS[5], r: 3 }}
                    activeDot={{ r: 5 }}
                    name="Connections"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartPlaceholder message="Add networking connections to see your growth." />
            )}
          </CardContent>
        </Card>
      </div>

      {/* No data at all */}
      {!hasData && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="flex size-16 items-center justify-center rounded-full bg-muted mb-4">
              <BarChart3 className="size-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No data to analyze</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4 text-center max-w-sm">
              Start using other modules to add data. Your analytics will populate automatically.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function EmptyChartPlaceholder({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-[300px]">
      <div className="text-center">
        <TrendingUp className="size-8 text-muted-foreground/40 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
