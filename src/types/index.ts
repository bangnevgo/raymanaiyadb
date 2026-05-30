export interface NorthStarGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  deadline: string | null;
}

export interface DailyPlan {
  id: string;
  date: string;
  priority1?: string;
  priority2?: string;
  priority3?: string;
  notes?: string;
  reflection?: string;
  timeBlocks?: DailyTimeBlock[];
  tasks?: DailyTask[];
}

export interface DailyTimeBlock {
  id: string;
  startTime: string;
  endTime: string;
  label: string;
  dayPlanId: string;
}

export interface DailyTask {
  id: string;
  title: string;
  completed: boolean;
  dayPlanId: string;
}

export interface LearningCategory {
  id: string;
  name: string;
  color: string;
  itemCount?: number;
}

export interface LearningItem {
  id: string;
  title: string;
  categoryId: string;
  category?: LearningCategory;
  progress: number;
  hoursSpent: number;
  notes?: string;
  streak: number;
  lastStudied?: string;
}

export interface Certification {
  id: string;
  name: string;
  provider: string;
  startDate?: string;
  targetCompletion?: string;
  completionPct: number;
  certificateUrl?: string;
  status: string;
}

export interface PortfolioProject {
  id: string;
  title: string;
  description?: string;
  skillsUsed?: string;
  aiUsed?: string;
  link?: string;
  completionDate?: string;
  status: string;
}

export interface JobApplication {
  id: string;
  company: string;
  position: string;
  country?: string;
  salaryRange?: string;
  jobLink?: string;
  applicationDate?: string;
  status: string;
  notes?: string;
}

export interface NetworkingConnection {
  id: string;
  name: string;
  company?: string;
  role?: string;
  platform: string;
  connectionDate?: string;
  lastInteraction?: string;
  notes?: string;
}

export interface IncomeEntry {
  id: string;
  date: string;
  source: string;
  category: string;
  amount: number;
  notes?: string;
}

export interface WeeklyReview {
  id: string;
  weekStartDate: string;
  wins: string;
  learnings: string;
  challenges: string;
  nextGoals: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  reflection: string;
  mood: string;
  energyLevel: number;
}

export interface Habit {
  id: string;
  title: string;
  emoji: string;
  frequency: string;
  color: string;
  entries?: HabitEntry[];
}

export interface HabitEntry {
  id: string;
  date: string;
  completed: boolean;
  habitId: string;
}

export interface DashboardSummary {
  totalLearningHours: number;
  certificationsCompleted: number;
  projectsCompleted: number;
  applicationsSent: number;
  connections: number;
  incomeGenerated: number;
}
