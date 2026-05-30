import { NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { db } from '@/lib/db';

// POST - AI Coach with full dashboard awareness
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, conversationHistory } = body as {
      message: string;
      conversationHistory?: Array<{ role: string; content: string }>;
    };

    // ───────────────────────────────────────────
    // 1. FETCH COMPLETE DASHBOARD DATA
    // ───────────────────────────────────────────
    const [
      goals,
      certifications,
      projects,
      jobs,
      learningCategories,
      learningItems,
      networkingConnections,
      incomeEntries,
      journalEntries,
      weeklyReviews,
      dailyPlans,
    ] = await Promise.all([
      db.northStarGoal.findMany({ orderBy: { createdAt: 'asc' } }),
      db.certification.findMany({ orderBy: { createdAt: 'asc' } }),
      db.portfolioProject.findMany({ orderBy: { createdAt: 'asc' } }),
      db.jobApplication.findMany({ orderBy: { applicationDate: 'desc' } }),
      db.learningCategory.findMany(),
      db.learningItem.findMany({ include: { category: true } }),
      db.networkingConnection.findMany({ orderBy: { connectionDate: 'desc' } }),
      db.incomeEntry.findMany({ orderBy: { date: 'desc' } }),
      db.journalEntry.findMany({ orderBy: { date: 'desc' } }),
      db.weeklyReview.findMany({ orderBy: { weekStartDate: 'desc' } }),
      db.dailyPlan.findMany({
        orderBy: { date: 'desc' },
        take: 7,
        include: { timeBlocks: true, tasks: true },
      }),
    ]);

    // ───────────────────────────────────────────
    // 2. BUILD COMPREHENSIVE USER PROFILE
    // ───────────────────────────────────────────

    // --- Goals Analysis ---
    const goalsAnalysis = goals.map((g) => {
      const pct = g.target > 0 ? Math.round((g.current / g.target) * 100) : 0;
      const deadlineStr = g.deadline ? new Date(g.deadline).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'No deadline';
      const daysLeft = g.deadline ? Math.max(0, Math.ceil((new Date(g.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : null;
      return {
        title: g.title,
        current: g.current,
        target: g.target,
        percentage: pct,
        deadline: deadlineStr,
        daysLeft,
        status: pct >= 100 ? 'COMPLETED' : pct >= 75 ? 'NEARLY THERE' : pct >= 50 ? 'HALFWAY' : pct > 0 ? 'IN PROGRESS' : 'NOT STARTED',
      };
    });

    // --- Certifications Analysis ---
    const certsAnalysis = {
      completed: certifications.filter((c) => c.status === 'Completed').map((c) => ({ name: c.name, provider: c.provider, completionPct: c.completionPct })),
      inProgress: certifications.filter((c) => c.status === 'In Progress').map((c) => ({ name: c.name, provider: c.provider, completionPct: c.completionPct, targetDate: c.targetCompletion })),
      planned: certifications.filter((c) => c.status === 'Planned').map((c) => ({ name: c.name, provider: c.provider })),
    };

    // --- Projects Analysis ---
    const projectsByStatus = {
      published: projects.filter((p) => p.status === 'Published').map((p) => ({ title: p.title, skills: p.skillsUsed, aiUsed: p.aiUsed, link: p.link })),
      review: projects.filter((p) => p.status === 'Review'),
      building: projects.filter((p) => p.status === 'Building'),
      planning: projects.filter((p) => p.status === 'Planning'),
      idea: projects.filter((p) => p.status === 'Idea').map((p) => ({ title: p.title, description: p.description })),
    };

    // Extract all unique skills from published + in-progress projects
    const allSkills = new Set<string>();
    projects.forEach((p) => {
      if (p.skillsUsed) p.skillsUsed.split(',').map((s) => s.trim()).filter(Boolean).forEach((s) => allSkills.add(s));
    });

    // --- Jobs Pipeline Analysis ---
    const jobStatusCounts: Record<string, number> = {};
    jobs.forEach((j) => { jobStatusCounts[j.status] = (jobStatusCounts[j.status] || 0) + 1; });
    const interviews = jobs.filter((j) => j.status === 'Interview').length;
    const offers = jobs.filter((j) => ['Offer', 'Accepted'].includes(j.status)).length;
    const rejected = jobs.filter((j) => j.status === 'Rejected').length;
    const applied = jobs.filter((j) => ['Applied', 'Assessment', 'Interview', 'Offer', 'Accepted'].includes(j.status)).length;
    const conversionRate = applied > 0 ? Math.round((interviews / applied) * 100) : 0;

    const recentJobs = jobs.slice(0, 10).map((j) => ({
      company: j.company,
      position: j.position,
      country: j.country,
      status: j.status,
      date: j.applicationDate,
      salary: j.salaryRange,
    }));

    // --- Learning Deep Analysis ---
    const learningByCategory: Record<string, Array<{ title: string; progress: number; hours: number; streak: number; lastStudied: string | null }>> = {};
    learningItems.forEach((item) => {
      const cat = item.category?.name || 'Uncategorized';
      if (!learningByCategory[cat]) learningByCategory[cat] = [];
      learningByCategory[cat].push({
        title: item.title,
        progress: item.progress,
        hours: item.hoursSpent,
        streak: item.streak,
        lastStudied: item.lastStudied,
      });
    });

    const totalHours = learningItems.reduce((s, i) => s + i.hoursSpent, 0);
    const avgProgress = learningItems.length > 0 ? Math.round(learningItems.reduce((s, i) => s + i.progress, 0) / learningItems.length) : 0;
    const stalledItems = learningItems.filter((i) => i.progress < 100 && i.streak === 0).map((i) => i.title);

    // --- Networking Analysis ---
    const networkByPlatform: Record<string, number> = {};
    networkingConnections.forEach((c) => { networkByPlatform[c.platform] = (networkByPlatform[c.platform] || 0) + 1; });
    const activeConnections = networkingConnections.filter((c) => {
      if (!c.lastInteraction) return false;
      const daysSince = Math.ceil((Date.now() - new Date(c.lastInteraction).getTime()) / (1000 * 60 * 60 * 24));
      return daysSince <= 30;
    }).length;
    const staleConnections = networkingConnections.filter((c) => {
      if (!c.lastInteraction) return true;
      const daysSince = Math.ceil((Date.now() - new Date(c.lastInteraction).getTime()) / (1000 * 60 * 60 * 24));
      return daysSince > 30;
    }).length;

    // --- Income Analysis ---
    const totalIncome = incomeEntries.reduce((s, e) => s + e.amount, 0);
    const now = new Date();
    const thisMonth = incomeEntries.filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).reduce((s, e) => s + e.amount, 0);
    const lastMonth = incomeEntries.filter((e) => {
      const d = new Date(e.date);
      const lm = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
      const ly = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      return d.getMonth() === lm && d.getFullYear() === ly;
    }).reduce((s, e) => s + e.amount, 0);
    const incomeByCategory: Record<string, number> = {};
    incomeEntries.forEach((e) => { incomeByCategory[e.category] = (incomeByCategory[e.category] || 0) + e.amount; });

    // --- Journal Mood & Energy Patterns ---
    const moodCounts: Record<string, number> = {};
    let avgEnergy = 0;
    journalEntries.forEach((e) => {
      moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
      avgEnergy += e.energyLevel;
    });
    avgEnergy = journalEntries.length > 0 ? Math.round(avgEnergy / journalEntries.length) : 0;
    const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Neutral';

    // Last 7 days mood trend
    const moodTrend = journalEntries.slice(0, 7).reverse().map((e) => ({
      date: e.date,
      mood: e.mood,
      energy: e.energyLevel,
      hasReflection: (e.reflection || '').length > 20,
    }));

    // --- Weekly Reviews Themes ---
    const recentChallenges = weeklyReviews.slice(0, 4).flatMap((r) =>
      r.challenges.split('.').map((s) => s.trim()).filter((s) => s.length > 10)
    );
    const recentWins = weeklyReviews.slice(0, 4).flatMap((r) =>
      r.wins.split('.').map((s) => s.trim()).filter((s) => s.length > 10)
    );
    const recentGoals = weeklyReviews.slice(0, 2).flatMap((r) =>
      r.nextGoals.split('.').map((s) => s.trim()).filter((s) => s.length > 10)
    );

    // --- Daily Plan Patterns ---
    const dailyPlanInsights = dailyPlans.map((dp) => {
      const completedTasks = dp.tasks.filter((t) => t.completed).length;
      const totalTasks = dp.tasks.length;
      return {
        date: dp.date,
        priorities: [dp.priority1, dp.priority2, dp.priority3].filter(Boolean),
        taskCompletionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        hasReflection: !!dp.reflection,
        timeBlocksCount: dp.timeBlocks.length,
      };
    });

    // ───────────────────────────────────────────
    // 3. ASSEMBLE FULL CONTEXT
    // ───────────────────────────────────────────
    const fullContext = {
      // USER PROFILE
      userProfile: {
        program: 'Gap Year AI & Remote Work (12 months)',
        ageGroup: '17-22 years old',
        background: 'Fresh graduate SMA, building career in digital/remote work',
        primaryObjective: 'Transform from fresh graduate to globally employable digital professional with remote income',
      },

      // NORTH STAR GOALS (annual targets)
      northStarGoals: goalsAnalysis,

      // LEARNING (skills development)
      learning: {
        totalHours,
        avgProgress,
        totalItems: learningItems.length,
        stalledItems,
        byCategory: learningByCategory,
        categories: learningCategories.map((c) => ({ name: c.name, color: c.color })),
      },

      // CERTIFICATIONS
      certifications: certsAnalysis,

      // PORTFOLIO PROJECTS
      portfolio: {
        total: projects.length,
        published: projectsByStatus.published.length,
        byStatus: {
          published: projectsByStatus.published.length,
          review: projectsByStatus.review.length,
          building: projectsByStatus.building.length,
          planning: projectsByStatus.planning.length,
          idea: projectsByStatus.idea.length,
        },
        allSkills: Array.from(allSkills),
        publishedProjects: projectsByStatus.published,
        ideas: projectsByStatus.idea,
      },

      // JOB APPLICATIONS (career pipeline)
      jobApplications: {
        total: jobs.length,
        byStatus: jobStatusCounts,
        interviews,
        offers,
        rejected,
        conversionRate,
        recentApplications: recentJobs,
      },

      // NETWORKING
      networking: {
        total: networkingConnections.length,
        activeConnections,
        staleConnections,
        byPlatform: networkByPlatform,
        allConnections: networkingConnections.slice(0, 20).map((c) => ({
          name: c.name,
          company: c.company,
          role: c.role,
          platform: c.platform,
          lastInteraction: c.lastInteraction,
          daysSinceInteraction: c.lastInteraction
            ? Math.ceil((Date.now() - new Date(c.lastInteraction).getTime()) / (1000 * 60 * 60 * 24))
            : null,
        })),
      },

      // INCOME
      income: {
        totalEarned: totalIncome,
        thisMonth,
        lastMonth,
        trend: thisMonth > lastMonth ? 'GROWING' : thisMonth < lastMonth ? 'DECLINING' : 'STABLE',
        byCategory: incomeByCategory,
        recentEntries: incomeEntries.slice(0, 10).map((e) => ({ date: e.date, source: e.source, category: e.category, amount: e.amount })),
        totalEntries: incomeEntries.length,
      },

      // JOURNAL & WELLBEING
      wellbeing: {
        totalEntries: journalEntries.length,
        dominantMood,
        averageEnergy: avgEnergy,
        moodDistribution: moodCounts,
        last7Days: moodTrend,
      },

      // WEEKLY REVIEWS
      reviews: {
        total: weeklyReviews.length,
        recentChallenges,
        recentWins,
        recentNextGoals: recentGoals,
      },

      // DAILY PLANS
      dailyPlans: {
        last7Days: dailyPlanInsights,
        avgTaskCompletion: dailyPlanInsights.length > 0
          ? Math.round(dailyPlanInsights.reduce((s, dp) => s + dp.taskCompletionRate, 0) / dailyPlanInsights.length)
          : 0,
      },
    };

    // ───────────────────────────────────────────
    // 4. COMPREHENSIVE SYSTEM PROMPT
    // ───────────────────────────────────────────
    const systemPrompt = `You are the AI Coach for "Nevgo Mission Control" — a Personal Operating System for a Gap Year student.

## WHO YOU ARE COACHING
- Age: 17-22 years old, fresh high school graduate
- Currently on a 12-month Gap Year program focused on AI, Digital Skills & Remote Work
- Goal: Transform from fresh graduate into a globally employable digital professional who earns remote income
- This dashboard is their MISSION CONTROL — the central hub of their entire gap year journey

## WHAT THE DASHBOARD TRACKS (you have access to ALL of this data)

### 1. NORTH STAR GOALS (Annual Targets)
These are the big-picture 12-month targets. Each has a progress counter and deadline.
Analyze: Are they on track? Which goals are lagging? Are deadlines realistic?

### 2. LEARNING TRACKER
Skills organized by category: English, AI, Technology, Business.
Each item has: progress %, hours spent, learning streak (consecutive days), last studied date.
Analyze: Learning consistency, skill gaps, stalled items (0 streak), category balance.

### 3. CERTIFICATIONS
Professional certs from providers like Google, Microsoft, IBM.
Statuses: Planned → In Progress → Completed.
Analyze: Completion rate, which certs to prioritize, time-to-completion estimates.

### 4. PORTFOLIO PROJECTS
Creative projects with workflow: Idea → Planning → Building → Review → Published.
Each has: title, description, skills used, AI tools used, link.
Analyze: Pipeline health (too many ideas? not enough published?), skill diversity, AI utilization.

### 5. JOB APPLICATIONS (CRM Pipeline)
Full job search pipeline: Wishlist → Applied → Assessment → Interview → Offer → Rejected/Accept.
Each has: company, position, country, salary range, date, notes.
Analyze: Conversion rate, pipeline stage distribution, response patterns, geographic spread.

### 6. NETWORKING CRM
Professional connections across LinkedIn, Discord, X, Email, Communities.
Tracks: connection date, last interaction, notes.
Analyze: Network growth, stale connections (>30 days no contact), platform diversity.

### 7. INCOME TRACKER
All earnings: Freelance, Remote Job, Affiliate, Project, Other.
Analyze: Income trends, category breakdown, growth rate, sustainability.

### 8. WEEKLY REVIEWS
Structured weekly reflections: Wins, Learnings, Challenges, Next Week Goals.
Analyze: Recurring challenges, learning patterns, goal-setting consistency.

### 9. PERSONAL JOURNAL
Daily entries with: mood (Great/Good/Neutral/Bad/Terrible), energy level (1-10), reflection.
Analyze: Mood/energy patterns, correlation between activity levels and mood, burnout signals.

### 10. DAILY COMMAND CENTER
Daily planning: Top 3 priorities, tasks with completion, time blocks (schedule), notes, reflection.
Analyze: Task completion rate, planning consistency, reflection habits.

## YOUR COACHING PRINCIPLES

1. **DATA-DRIVEN**: Always reference specific numbers, percentages, and patterns from the data. Never give generic advice.
2. **HOLISTIC**: Connect insights across modules. E.g., "Your mood dropped when you stopped learning for 3 days" or "Your job application conversion improved after you added 2 portfolio projects."
3. **PATTERN RECOGNITION**: Identify trends that the user might not see — learning streaks ending, networking gaps, income fluctuations, mood correlations.
4. **ACTIONABLE**: Every recommendation must be specific and doable THIS WEEK. Not "improve networking" but "Reach out to 3 stale LinkedIn connections this week."
5. **PRIORITIZED**: Tell the user what matters MOST right now, not a laundry list of everything.
6. **SUPPORTIVE BUT HONEST**: Celebrate real wins. Call out concerning patterns. Be direct about risks.
7. **CONTEXT-AWARE**: Remember this is a gap year student — advice should match their life stage. Not corporate advice.
8. **INDONESIAN-FRIENDLY**: The user understands both English and Indonesian. Use English primarily but you may include Indonesian phrases or references naturally.

## RESPONSE FORMAT
- Use bullet points and short paragraphs
- Bold key metrics and insights
- Start with the most important insight
- End with 2-3 concrete action items
- Keep responses concise but substantive (200-400 words typically)`;

    // ───────────────────────────────────────────
    // 5. BUILD MESSAGES ARRAY WITH CONTEXT
    // ───────────────────────────────────────────
    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: systemPrompt },
    ];

    // Add conversation history for context continuity (last 6 messages)
    if (conversationHistory && conversationHistory.length > 0) {
      const recentHistory = conversationHistory.slice(-6);
      for (const msg of recentHistory) {
        messages.push({ role: msg.role, content: msg.content });
      }
    }

    // Build the user message with full dashboard data context
    const userMessage = `The user says:\n"${message}"\n\nHere is their COMPLETE dashboard data for analysis:\n\n${JSON.stringify(fullContext, null, 2)}\n\nBased on ALL the data above, provide a comprehensive, data-driven response to the user's message. Reference specific numbers, identify patterns across modules, and give actionable recommendations.`;

    messages.push({ role: 'user', content: userMessage });

    // ───────────────────────────────────────────
    // 6. CALL AI
    // ───────────────────────────────────────────
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: messages.map((m) => ({ role: m.role as 'system' | 'user' | 'assistant', content: m.content })),
    });

    const advice = completion.choices[0]?.message?.content || 'Maaf, saya tidak bisa menghasilkan analisis saat ini. Silakan coba lagi.';

    return NextResponse.json({ advice });
  } catch (error) {
    console.error('Error in AI coach:', error);
    return NextResponse.json(
      { error: 'Failed to generate coaching advice' },
      { status: 500 }
    );
  }
}
