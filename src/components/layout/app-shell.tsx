'use client';

import React from 'react';
import Image from 'next/image';
import { useAppStore, type Page } from '@/store/app-store';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  Rocket,
  Target,
  Calendar,
  BookOpen,
  Award,
  FolderGit2,
  Briefcase,
  Users,
  DollarSign,
  ClipboardCheck,
  PenLine,
  BarChart3,
  Bot,
  ChevronsUpDown,
  Flame,
  MapPin,
  Settings,
} from 'lucide-react';

import { NotificationPanel } from '@/components/modules/notification-panel';
import { DashboardModule } from '@/components/modules/dashboard-module';
import { GoalsModule } from '@/components/modules/goals-module';
import { DailyModule } from '@/components/modules/daily-module';
import { LearningModule } from '@/components/modules/learning-module';
import { CertificationsModule } from '@/components/modules/certifications-module';
import { PortfolioModule } from '@/components/modules/portfolio-module';
import { JobsModule } from '@/components/modules/jobs-module';
import { NetworkingModule } from '@/components/modules/networking-module';
import { IncomeModule } from '@/components/modules/income-module';
import { ReviewsModule } from '@/components/modules/reviews-module';
import { JournalModule } from '@/components/modules/journal-module';
import { AnalyticsModule } from '@/components/modules/analytics-module';
import { AiCoachModule } from '@/components/modules/ai-coach-module';
import { HabitModule } from '@/components/modules/habit-module';
import { ProgramTargetModule } from '@/components/modules/program-target-module';
import { SettingsModule } from '@/components/modules/settings-module';

interface NavItem {
  page: Page;
  label: string;
  icon: React.ElementType;
}

const mainNav: NavItem[] = [
  { page: 'dashboard', label: 'Dashboard', icon: Rocket },
  { page: 'goals', label: 'North Star Goals', icon: Target },
  { page: 'daily', label: 'Daily Command Center', icon: Calendar },
  { page: 'habits', label: 'Habit Tracker', icon: Flame },
];

const growthNav: NavItem[] = [
  { page: 'learning', label: 'Learning Tracker', icon: BookOpen },
  { page: 'certifications', label: 'Certifications', icon: Award },
  { page: 'portfolio', label: 'Portfolio Projects', icon: FolderGit2 },
];

const careerNav: NavItem[] = [
  { page: 'jobs', label: 'Job Applications', icon: Briefcase },
  { page: 'networking', label: 'Networking', icon: Users },
  { page: 'income', label: 'Income Tracker', icon: DollarSign },
];

const reviewNav: NavItem[] = [
  { page: 'reviews', label: 'Weekly Reviews', icon: ClipboardCheck },
  { page: 'journal', label: 'Journal', icon: PenLine },
  { page: 'analytics', label: 'Analytics', icon: BarChart3 },
  { page: 'ai-coach', label: 'AI Coach', icon: Bot },
];

const programNav: NavItem[] = [
  { page: 'program-target', label: 'Program & Target', icon: MapPin },
];

const systemNav: NavItem[] = [
  { page: 'settings', label: 'Settings', icon: Settings },
];

function NavSection({ label, items }: { label: string; items: NavItem[] }) {
  const { currentPage, setCurrentPage } = useAppStore();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.page}>
              <SidebarMenuButton
                isActive={currentPage === item.page}
                onClick={() => setCurrentPage(item.page)}
                tooltip={item.label}
              >
                <item.icon />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div className="flex items-center gap-3">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Image
                    src="/logo.png"
                    alt="RAYMANAIYA"
                    width={32}
                    height={32}
                    className="rounded-lg"
                  />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold text-sm">RAYMANAIYA</span>
                  <span className="text-xs text-muted-foreground">Mission Control</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="pt-2">
        <NavSection label="Main" items={mainNav} />
        <NavSection label="Growth" items={growthNav} />
        <NavSection label="Career" items={careerNav} />
        <NavSection label="Review" items={reviewNav} />
        <NavSection label="Program" items={programNav} />
        <NavSection label="System" items={systemNav} />
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="sm" tooltip="Collapse" asChild>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <ChevronsUpDown className="size-4" />
                <span>Collapse</span>
              </Button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function PageRenderer() {
  const { currentPage } = useAppStore();

  return (
    <>
      {/* Modules yang perlu persist state (tidak boleh unmount) */}
      <div style={{ display: currentPage === 'ai-coach' ? 'block' : 'none' }}>
        <AiCoachModule />
      </div>

      {/* Modules biasa — hanya render saat aktif */}
      {currentPage === 'dashboard' && <DashboardModule />}
      {currentPage === 'goals' && <GoalsModule />}
      {currentPage === 'daily' && <DailyModule />}
      {currentPage === 'learning' && <LearningModule />}
      {currentPage === 'certifications' && <CertificationsModule />}
      {currentPage === 'portfolio' && <PortfolioModule />}
      {currentPage === 'jobs' && <JobsModule />}
      {currentPage === 'networking' && <NetworkingModule />}
      {currentPage === 'income' && <IncomeModule />}
      {currentPage === 'reviews' && <ReviewsModule />}
      {currentPage === 'journal' && <JournalModule />}
      {currentPage === 'analytics' && <AnalyticsModule />}
      {currentPage === 'habits' && <HabitModule />}
      {currentPage === 'program-target' && <ProgramTargetModule />}
      {currentPage === 'settings' && <SettingsModule />}
    </>
  );
}

function PageHeader() {
  const { currentPage } = useAppStore();

  const titles: Record<Page, { title: string; description: string }> = {
    dashboard: {
      title: 'Dashboard',
      description: 'Overview of your mission progress',
    },
    goals: {
      title: 'North Star Goals',
      description: 'Track your long-term objectives',
    },
    daily: {
      title: 'Daily Command Center',
      description: 'Plan and execute your day',
    },
    learning: {
      title: 'Learning Tracker',
      description: 'Monitor your skill development',
    },
    certifications: {
      title: 'Certifications',
      description: 'Track professional certifications',
    },
    portfolio: {
      title: 'Portfolio Projects',
      description: 'Showcase your best work',
    },
    jobs: {
      title: 'Job Applications',
      description: 'Manage your job search pipeline',
    },
    networking: {
      title: 'Networking',
      description: 'Build and maintain connections',
    },
    income: {
      title: 'Income Tracker',
      description: 'Monitor your earnings',
    },
    reviews: {
      title: 'Weekly Reviews',
      description: 'Reflect on your weekly progress',
    },
    journal: {
      title: 'Journal',
      description: 'Record your thoughts and reflections',
    },
    analytics: {
      title: 'Analytics',
      description: 'Deep dive into your data',
    },
    'ai-coach': {
      title: 'AI Coach',
      description: 'Get personalized guidance',
    },
    habits: {
      title: 'Habit Tracker',
      description: 'Track daily habits and build consistency',
    },
    'program-target': {
      title: 'Program & Target',
      description: 'Gap Year Accelerator Program 12 Bulan',
    },
    settings: {
      title: 'Settings',
      description: 'Configure AI providers and dashboard preferences',
    },
  };

  const { title, description } = titles[currentPage];

  return (
    <header className="flex flex-col gap-1 border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        </div>
        <NotificationPanel />
      </div>
      <p className="text-sm text-muted-foreground pl-8">{description}</p>
    </header>
  );
}

export function AppShell() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <PageHeader />
        <main className="flex-1 p-6">
          <PageRenderer />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
