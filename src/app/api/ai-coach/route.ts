import { NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { db } from '@/lib/db';

// POST - AI Coach with full dashboard awareness
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, conversationHistory, currency, exchangeRate } = body as {
      message: string;
      conversationHistory?: Array<{ role: string; content: string }>;
      currency?: string;
      exchangeRate?: number;
    };

    // ───────────────────────────────────────────
    // 1. FETCH COMPLETE DASHBOARD DATA (graceful fallback if DB unavailable)
    // ───────────────────────────────────────────
    let goals: any[] = [], certifications: any[] = [], projects: any[] = [],
      jobs: any[] = [], learningCategories: any[] = [], learningItems: any[] = [],
      networkingConnections: any[] = [], incomeEntries: any[] = [], journalEntries: any[] = [],
      weeklyReviews: any[] = [], dailyPlans: any[] = [];

    try {
      const result = await Promise.allSettled([
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
      goals = result[0].status === 'fulfilled' ? result[0].value : [];
      certifications = result[1].status === 'fulfilled' ? result[1].value : [];
      projects = result[2].status === 'fulfilled' ? result[2].value : [];
      jobs = result[3].status === 'fulfilled' ? result[3].value : [];
      learningCategories = result[4].status === 'fulfilled' ? result[4].value : [];
      learningItems = result[5].status === 'fulfilled' ? result[5].value : [];
      networkingConnections = result[6].status === 'fulfilled' ? result[6].value : [];
      incomeEntries = result[7].status === 'fulfilled' ? result[7].value : [];
      journalEntries = result[8].status === 'fulfilled' ? result[8].value : [];
      weeklyReviews = result[9].status === 'fulfilled' ? result[9].value : [];
      dailyPlans = result[10].status === 'fulfilled' ? result[10].value : [];
    } catch {
      // DB unavailable — continue with empty data
    }

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
    const currentCurrency = currency || 'USD';
    const currentRate = exchangeRate || 1;

    const fullContext = {
      // USER PROFILE
      userProfile: {
        program: 'Gap Year AI & Remote Work (12 months)',
        ageGroup: '17-22 years old',
        background: 'Fresh graduate SMA, building career in digital/remote work',
        primaryObjective: 'Transform from fresh graduate to globally employable digital professional with remote income',
        currency: currentCurrency,
        exchangeRate: currentRate,
        currencyNote: currentCurrency === 'IDR'
          ? `User prefers IDR (Rupiah). All income amounts are stored in USD. 1 USD = ${currentRate} IDR (source: Bank Indonesia). When displaying income, convert to IDR by multiplying by ${currentRate}. Format IDR as "Rp" with no decimals (e.g., Rp57,895,500).`
          : 'User uses USD for all currency displays.',
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

## YOUR KNOWLEDGE BASE (Real-time Dashboard Data)
Below is the current state of the user's dashboard. Use this data to provide accurate, specific, and personalized coaching.

${JSON.stringify(fullContext, null, 2)}

## WHAT THE DASHBOARD TRACKS
- NORTH STAR GOALS: Annual targets, progress, and deadlines.
- LEARNING TRACKER: Skills, progress %, hours, and streaks.
- CERTIFICATIONS: Professional certs and their statuses.
- PORTFOLIO PROJECTS: Creative pipeline from Idea to Published.
- JOB APPLICATIONS: CRM Pipeline from Wishlist to Accepted.
- NETWORKING CRM: Professional connections and interaction dates.
- INCOME TRACKER: Earnings across various categories.
- WEEKLY REVIEWS: Wins, Learnings, Challenges, and Next Goals.
- PERSONAL JOURNAL: Daily mood and energy levels.
- DAILY COMMAND CENTER: Priorities and task completion rates.

## YOUR COACHING PRINCIPLES
1. **DATA-DRIVEN**: Always reference specific numbers, percentages, and patterns from the data provided above.
2. **HOLISTIC**: Connect insights across modules. E.g., "Your mood dropped when you stopped learning for 3 days."
3. **PATTERN RECOGNITION**: Identify trends (e.g., learning streaks ending, mood correlations).
4. **ACTIONABLE**: Every recommendation must be specific and doable THIS WEEK.
5. **PRIORITIZED**: Tell the user what matters MOST right now.
6. **SUPPORTIVE BUT HONEST**: Celebrate wins, but call out concerning patterns directly.
7. **CONTEXT-AWARE**: Advice should match a gap year student's life stage.
8. **INDONESIAN-FRIENDLY**: User understands English and Indonesian. Use English primarily but feel free to use Indonesian naturally.

## CONVERSATION STYLE
- Maintain a continuous, conversational flow.
- If the user asks a simple question, answer concisely.
- If the user asks for analysis, be detailed and data-driven.
- Do not repeat the entire data analysis in every response unless asked.
- Treat this as a long-term coaching relationship.

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

    // The user message is now pure, allowing for natural conversation flow
    messages.push({ role: 'user', content: message });

    // ───────────────────────────────────────────
    // 6. CALL AI BASED ON PROVIDER
    // ───────────────────────────────────────────
    const { provider = 'zai', apiKey, opencodeBaseUrl } = body as {
      provider?: string;
      apiKey?: string;
      opencodeBaseUrl?: string;
    };

    let advice: string;

    if (provider === 'zai') {
      // Z.AI provider (default, uses SDK — no API key needed)
      const zai = await ZAI.create();
      const completion = await zai.chat.completions.create({
        messages: messages.map((m) => ({
          role: m.role as 'system' | 'user' | 'assistant',
          content: m.content,
        })),
      });
      advice = completion.choices[0]?.message?.content || 'Maaf, saya tidak bisa menghasilkan analisis saat ini. Silakan coba lagi.';
    } else if (provider === 'cloudflare') {
      // Cloudflare AI — uses Account ID + API Token from env (server-side, secure)
      const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
      const apiToken = process.env.CLOUDFLARE_API_TOKEN;

      if (!accountId || !apiToken) {
        return NextResponse.json(
          { error: 'Cloudflare credentials not configured. Please set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN in .env' },
          { status: 400 }
        );
      }

      const cfModel = '@cf/moonshotai/kimi-k2.6';
      const cfUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${cfModel}`;

      const response = await fetch(cfUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiToken}`,
        },
        body: JSON.stringify({
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          max_tokens: 4096,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`[cloudflare] API error:`, response.status, errText);
        return NextResponse.json(
          { error: `Cloudflare AI error (${response.status}): ${errText.slice(0, 200)}` },
          { status: 502 }
        );
      }

      const data = await response.json();
      // Cloudflare AI returns result.response directly
      advice = data.result?.response || data.choices?.[0]?.message?.content || 'Maaf, saya tidak bisa menghasilkan analisis saat ini. Silakan coba lagi.';
    } else if (provider === 'openrouter') {
      // OpenRouter — API key dari env (server-side, secure, tidak expose ke client)
      const orApiKey = process.env.OPENROUTER_API_KEY;

      if (!orApiKey) {
        return NextResponse.json(
          { error: 'OpenRouter API key not configured. Please set OPENROUTER_API_KEY in .env' },
          { status: 400 }
        );
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${orApiKey}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Nevgo Mission Control',
        },
        body: JSON.stringify({
          model: 'openrouter/owl-alpha',
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          max_tokens: 4096,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`[openrouter] API error:`, response.status, errText);
        return NextResponse.json(
          { error: `OpenRouter error (${response.status}): ${errText.slice(0, 200)}` },
          { status: 502 }
        );
      }

      const data = await response.json();
      advice = data.choices?.[0]?.message?.content || 'Maaf, saya tidak bisa menghasilkan analisis saat ini. Silakan coba lagi.';
    } else {
      // OpenAI-compatible providers (Nvidia, OpenCode)
      let baseUrl: string;
      let model: string;

      switch (provider) {
        case 'nvidia':
          baseUrl = 'https://integrate.api.nvidia.com/v1';
          model = 'meta/llama-3.1-405b-instruct';
          break;
        case 'opencode':
          baseUrl = opencodeBaseUrl || 'http://localhost:4096/v1';
          model = 'default';
          break;
        default:
          return NextResponse.json({ error: `Unknown provider: ${provider}` }, { status: 400 });
      }

      if (!apiKey) {
        return NextResponse.json(
          { error: `API key required for ${provider}. Please set it in Settings.` },
          { status: 400 }
        );
      }

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          max_tokens: 4096,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`[${provider}] API error:`, response.status, errText);
        return NextResponse.json(
          { error: `${provider} API error (${response.status}): ${errText.slice(0, 200)}` },
          { status: 502 }
        );
      }

      const data = await response.json();
      advice = data.choices?.[0]?.message?.content || 'Maaf, saya tidak bisa menghasilkan analisis saat ini. Silakan coba lagi.';
    }

    return NextResponse.json({ advice });
  } catch (error) {
    console.error('Error in AI coach:', error);
    return NextResponse.json(
      { error: 'Failed to generate coaching advice' },
      { status: 500 }
    );
  }
}
