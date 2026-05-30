import { NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { db } from '@/lib/db';

// POST - AI Coach analyzes user progress and provides actionable advice
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { focusArea } = body;

    // Gather real data from the database
    const [goals, certifications, projects, jobs, learningItems, incomeEntries, journalEntries, weeklyReviews] =
      await Promise.all([
        db.northStarGoal.findMany({ orderBy: { createdAt: 'asc' } }),
        db.certification.findMany(),
        db.portfolioProject.findMany(),
        db.jobApplication.findMany({ orderBy: { applicationDate: 'desc' } }),
        db.learningItem.findMany({ include: { category: true } }),
        db.incomeEntry.findMany({ orderBy: { date: 'desc' }, take: 10 }),
        db.journalEntry.findMany({ orderBy: { date: 'desc' }, take: 7 }),
        db.weeklyReview.findMany({ orderBy: { weekStartDate: 'desc' }, take: 3 }),
      ]);

    const totalIncome = await db.incomeEntry.aggregate({ _sum: { amount: true } });
    const totalHours = await db.learningItem.aggregate({ _sum: { hoursSpent: true } });

    const userData = {
      goals: goals.map((g) => ({ title: g.title, progress: `${g.current}/${g.target}`, deadline: g.deadline })),
      certifications: {
        completed: certifications.filter((c) => c.status === 'Completed').length,
        inProgress: certifications.filter((c) => c.status === 'In Progress').length,
        planned: certifications.filter((c) => c.status === 'Planned').length,
      },
      projects: {
        published: projects.filter((p) => p.status === 'Published').length,
        inProgress: projects.filter((p) => ['Building', 'Planning', 'Review'].includes(p.status)).length,
        ideas: projects.filter((p) => p.status === 'Idea').length,
      },
      jobApplications: {
        total: jobs.length,
        byStatus: jobs.reduce(
          (acc, j) => {
            acc[j.status] = (acc[j.status] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        ),
        recentActivity: jobs.slice(0, 5).map((j) => ({ company: j.company, status: j.status })),
      },
      learning: {
        totalHours: totalHours._sum.hoursSpent ?? 0,
        categories: learningItems.map((i) => ({
          topic: i.title,
          category: i.category.name,
          progress: i.progress,
          hoursSpent: i.hoursSpent,
          streak: i.streak,
        })),
      },
      income: {
        totalEarned: totalIncome._sum.amount ?? 0,
        recentEntries: incomeEntries.slice(0, 5).map((e) => ({
          source: e.source,
          amount: e.amount,
          date: e.date,
        })),
      },
      mood: journalEntries.map((e) => ({ date: e.date, mood: e.mood, energy: e.energyLevel })),
      recentWins: weeklyReviews.flatMap((r) => r.wins.split('.').filter(Boolean).slice(0, 3)),
    };

    const systemPrompt = `You are an AI career and life coach for someone on a gap year focused on:
1. Becoming a world-class full-stack developer
2. Landing a remote tech job (target: $100k+)
3. Building income through freelancing
4. Developing a strong professional network
5. Maintaining physical and mental health

Your coaching style is:
- Direct, honest, and supportive
- Data-driven — always reference specific numbers from their progress
- Actionable — every piece of advice should have a concrete next step
- Encouraging but realistic
- Concise — use bullet points and short paragraphs

You have access to the user's complete dashboard data including goals, certifications, projects, job applications, learning progress, income, journal entries, and weekly reviews.`;

    let focusInstruction = '';
    if (focusArea) {
      focusInstruction = `\n\nThe user wants advice specifically about: ${focusArea}. Focus your response on this area while considering their overall progress.`;
    }

    const userPrompt = `Here is my complete progress data for my gap year:

${JSON.stringify(userData, null, 2)}

Please analyze my progress and provide:
1. What's going well (specific wins and metrics)
2. What needs immediate attention (gaps, risks, stalled progress)
3. 3-5 specific, actionable recommendations for this week
4. One longer-term strategic insight${focusInstruction}

Keep your response under 400 words. Use a warm but professional tone.`;

    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });

    const advice = completion.choices[0]?.message?.content ?? 'Unable to generate coaching advice at this time.';

    return NextResponse.json({ advice });
  } catch (error) {
    console.error('Error in AI coach:', error);
    return NextResponse.json(
      { error: 'Failed to generate coaching advice' },
      { status: 500 }
    );
  }
}
