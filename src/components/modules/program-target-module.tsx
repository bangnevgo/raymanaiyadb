'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Target,
  Brain,
  Star,
  CalendarDays,
  Rocket,
  GraduationCap,
  TrendingUp,
  Clock,
  BookOpen,
  Wrench,
  Palette,
  Globe,
  Users,
  Lightbulb,
  Briefcase,
  Award,
  FolderOpen,
  Presentation,
  Share2,
  DollarSign,
  MapPin,
} from 'lucide-react';

// === Data Constants ===
const coreCurriculum = [
  { pillar: 'Structured Thinking', focus: 'Problem Solving, Goal Setting, Systems Thinking', icon: Brain },
  { pillar: 'Prompt Engineering', focus: 'AI Collaboration & Critical Thinking', icon: Lightbulb },
  { pillar: 'AI Productivity', focus: 'Research, Writing, Analysis', icon: Wrench },
  { pillar: 'Visual Communication', focus: 'Canva, Presentation, Storytelling', icon: Palette },
  { pillar: 'Builder Mindset', focus: 'Dashboard, Automation, Mini Apps', icon: Wrench },
  { pillar: 'Remote Work Readiness', focus: 'Portfolio, CV, LinkedIn, Networking', icon: Globe },
];

const dailySchedule = [
  { time: '09:00 - 10:00', activity: 'English Communication', icon: BookOpen },
  { time: '10:00 - 11:00', activity: 'Structured Thinking & AI', icon: Brain },
  { time: '11:00 - 13:00', activity: 'Project Building', icon: FolderOpen },
  { time: '14:00 - 15:00', activity: 'Builder Hour (Canva / Dashboard / Automation)', icon: Wrench },
];

const phases = [
  {
    number: 1,
    months: 'Bulan 1-3',
    title: 'Foundation & Market Readiness',
    color: 'bg-blue-500',
    colorLight: 'bg-blue-500/10 text-blue-500',
    borderColor: 'border-l-blue-500',
    items: [
      'Prompt Engineering',
      'AI Research',
      'Business English',
      'Canva Design',
      'LinkedIn Optimization',
      'CV Building',
      'Portfolio Website',
    ],
    targets: [
      '10-15 Portfolio Projects',
      '3 AI Certifications',
      'LinkedIn Professional',
      'CV International',
      'Mulai Apply Remote Job',
    ],
  },
  {
    number: 2,
    months: 'Bulan 4-6',
    title: 'Builder & Creator Development',
    color: 'bg-emerald-500',
    colorLight: 'bg-emerald-500/10 text-emerald-500',
    borderColor: 'border-l-emerald-500',
    items: [
      'Dashboard Building',
      'Automation Basics',
      'AI Workflow',
      'Content Creation',
      'Presentation Design',
      'Research Projects',
    ],
    targets: [
      '20+ Portfolio Projects',
      'Portfolio Website',
      'First Interview',
      'First Client / Project',
    ],
  },
  {
    number: 3,
    months: 'Bulan 7-9',
    title: 'Specialization',
    color: 'bg-violet-500',
    colorLight: 'bg-violet-500/10 text-violet-500',
    borderColor: 'border-l-violet-500',
    items: [
      'AI Content Creator',
      'Presentation Designer',
      'Research Assistant',
      'Digital Operations',
      'AI Automation',
    ],
    targets: [
      'Spesialisasi Utama Terpilih',
      'Personal Brand Mulai Terbentuk',
      'Remote Job Pipeline Aktif',
    ],
  },
  {
    number: 4,
    months: 'Bulan 10-12',
    title: 'Professional Launch',
    color: 'bg-amber-500',
    colorLight: 'bg-amber-500/10 text-amber-500',
    borderColor: 'border-l-amber-500',
    items: [
      'Advanced Portfolio',
      'Networking Expansion',
      'Community Contribution',
      'Public Sharing',
      'Mini Webinar / Workshop',
    ],
    targets: [
      'Income Side Hustle',
      '30+ Projects',
      'Strong Portfolio',
      'Ready for University or Remote Career',
    ],
  },
];

const kpis = [
  { value: '3+', label: 'Sertifikasi AI', icon: Award, color: 'bg-primary' },
  { value: '30+', label: 'Portfolio Projects', icon: FolderOpen, color: 'bg-emerald-600' },
  { value: '100+', label: 'Job Applications', icon: Briefcase, color: 'bg-blue-600' },
  { value: '50+', label: 'Networking Connections', icon: Users, color: 'bg-violet-600' },
  { value: '12', label: 'Monthly Reviews', icon: ClipboardCheck, color: 'bg-amber-600' },
  { value: '1', label: 'Remote Job / Side Hustle', icon: DollarSign, color: 'bg-rose-600' },
];

const teachBackItems = [
  'Apa yang dipelajari minggu ini',
  'Apa yang dibangun minggu ini',
  'Apa kesulitan terbesar',
  'Apa target minggu depan',
];

// === Helper icon components ===
function ClipboardCheck({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function ProgramTargetModule() {
  return (
    <div className="space-y-6">
      {/* Hero Banner - Misi Utama */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-6 text-primary-foreground">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI2dyaWQpIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+')] opacity-50" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex size-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                <Target className="size-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Misi Utama</h2>
                <p className="text-sm text-white/80">Global AI Career OS</p>
              </div>
            </div>
            <p className="text-white/90 text-base leading-relaxed max-w-3xl">
              Menjadikan tahun gap year sebagai tahun percepatan pertumbuhan, bukan tahun menunggu.
            </p>
            <div className="mt-4 rounded-xl bg-white/10 backdrop-blur-sm p-4 border border-white/10">
              <p className="text-sm font-semibold text-white/70 mb-1">Target 12 Bulan:</p>
              <p className="text-white/95 text-sm leading-relaxed">
                Menjadi individu yang mampu berpikir terstruktur, memanfaatkan AI secara profesional, membangun portofolio, membangun jaringan, dan siap bekerja secara global.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Filosofi Program */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="size-5 text-violet-500" />
            <CardTitle className="text-lg">Filosofi Program</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-lg border border-dashed border-muted-foreground/30 p-4 text-center">
              <p className="text-sm font-medium text-muted-foreground">Bukan belajar AI semata.</p>
            </div>
            <div className="rounded-lg border border-dashed border-muted-foreground/30 p-4 text-center">
              <p className="text-sm font-medium text-muted-foreground">Bukan sekadar mengejar sertifikat.</p>
            </div>
            <div className="rounded-lg border border-dashed border-muted-foreground/30 p-4 text-center">
              <p className="text-sm font-medium text-muted-foreground">Bukan sekadar mencari uang.</p>
            </div>
          </div>
          <div className="rounded-xl bg-primary/5 border border-primary/10 p-4">
            <p className="text-sm font-semibold text-primary mb-2">Membangun Human Operating System</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI hanyalah alat. Tujuan utama adalah membentuk pola pikir sistematis, problem solving, komunikasi, dan kemampuan belajar sepanjang hayat.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Core Curriculum */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Star className="size-5 text-amber-500" />
            <CardTitle className="text-lg">Core Curriculum</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border overflow-hidden">
            <div className="grid grid-cols-2 bg-muted/50">
              <div className="p-3 font-semibold text-sm text-muted-foreground">Pilar</div>
              <div className="p-3 font-semibold text-sm text-muted-foreground">Fokus</div>
            </div>
            {coreCurriculum.map((item, i) => (
              <div
                key={i}
                className={`grid grid-cols-2 ${i < coreCurriculum.length - 1 ? 'border-b' : ''}`}
              >
                <div className="p-3 flex items-center gap-2">
                  <item.icon className="size-4 text-primary shrink-0" />
                  <span className="text-sm font-medium">{item.pillar}</span>
                </div>
                <div className="p-3 text-sm text-muted-foreground">{item.focus}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Daily Schedule */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CalendarDays className="size-5 text-blue-500" />
            <CardTitle className="text-lg">Daily Schedule</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dailySchedule.map((slot, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2 shrink-0 w-[140px]">
                  <Clock className="size-4 text-muted-foreground" />
                  <span className="text-sm font-mono font-medium">{slot.time}</span>
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                    <slot.icon className="size-4 text-primary" />
                  </div>
                  <span className="text-sm">{slot.activity}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 4 Phases */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Rocket className="size-5 text-primary" />
          <h2 className="text-lg font-semibold">Program Phases</h2>
        </div>

        {phases.map((phase) => (
          <Card key={phase.number} className={`border-l-4 ${phase.borderColor}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Badge className={`${phase.colorLight} border-0`}>
                  Fase {phase.number}
                </Badge>
                <span className="text-sm text-muted-foreground font-medium">
                  {phase.months}
                </span>
              </div>
              <CardTitle className="text-base">{phase.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Learning Items */}
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-2">Yang Dipelajari:</p>
                <div className="flex flex-wrap gap-2">
                  {phase.items.map((item, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
              {/* Targets */}
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-2">Target:</p>
                <ul className="space-y-1.5">
                  {phase.targets.map((target, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <TrendingUp className="size-3.5 mt-0.5 text-emerald-500 shrink-0" />
                      <span>{target}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Weekly Teach Back */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <GraduationCap className="size-5 text-emerald-500" />
            <CardTitle className="text-lg">Weekly Teach Back Session</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Setiap Sabtu wajib menjelaskan kepada mentor:
          </p>
          <ul className="space-y-2">
            {teachBackItems.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm">
                <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 flex items-center gap-2">
            <Lightbulb className="size-4 text-emerald-500 shrink-0" />
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              Prinsip: Belajar → Membuat → Mengajar
            </p>
          </div>
        </CardContent>
      </Card>

      {/* KPI Tahunan */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="size-5 text-primary" />
            <CardTitle className="text-lg">KPI Tahunan</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {kpis.map((kpi, i) => (
              <div
                key={i}
                className="rounded-xl bg-gradient-to-b from-muted/80 to-muted/50 p-4 text-center space-y-2 border"
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 mx-auto">
                  <kpi.icon className="size-5 text-primary" />
                </div>
                <p className="text-2xl font-bold">{kpi.value}</p>
                <p className="text-xs text-muted-foreground leading-tight">{kpi.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Footer Tagline */}
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">
          Global AI Career OS &copy; 2026
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          Build Skills &bull; Build Systems &bull; Build Future
        </p>
      </div>
    </div>
  );
}
