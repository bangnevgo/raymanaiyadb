import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET summary statistics across the entire dashboard
export async function GET() {
  try {
    const [
      totalLearningHours,
      completedCertifications,
      publishedProjects,
      totalApplications,
      totalConnections,
      incomeResult,
      inProgressCertifications,
      inProgressProjects,
      learningCategories,
      weeklyReviewCount,
      journalEntryCount,
      latestJournal,
    ] = await Promise.all([
      // Total learning hours
      db.learningItem.aggregate({
        _sum: { hoursSpent: true },
      }),

      // Completed certifications
      db.certification.count({
        where: { status: 'Completed' },
      }),

      // Published portfolio projects
      db.portfolioProject.count({
        where: { status: 'Published' },
      }),

      // Total job applications sent
      db.jobApplication.count({
        where: {
          status: {
            in: ['Applied', 'Assessment', 'Interview', 'Offer', 'Accepted'],
          },
        },
      }),

      // Total networking connections
      db.networkingConnection.count(),

      // Total income
      db.incomeEntry.aggregate({
        _sum: { amount: true },
      }),

      // In-progress certifications
      db.certification.count({
        where: { status: 'In Progress' },
      }),

      // In-progress projects
      db.portfolioProject.count({
        where: { status: { in: ['Planning', 'Building', 'Review'] } },
      }),

      // Learning categories count
      db.learningCategory.count(),

      // Weekly review count
      db.weeklyReview.count(),

      // Journal entry count
      db.journalEntry.count(),

      // Latest journal entry
      db.journalEntry.findFirst({
        orderBy: { date: 'desc' },
        select: { date: true, mood: true, energyLevel: true },
      }),
    ]);

    return NextResponse.json({
      totalLearningHours: totalLearningHours._sum.hoursSpent ?? 0,
      completedCertifications,
      inProgressCertifications,
      publishedProjects,
      inProgressProjects,
      totalApplications,
      totalConnections,
      totalIncome: incomeResult._sum.amount ?? 0,
      learningCategories,
      weeklyReviews: weeklyReviewCount,
      journalEntries: journalEntryCount,
      latestJournal,
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch summary stats' },
      { status: 500 }
    );
  }
}
