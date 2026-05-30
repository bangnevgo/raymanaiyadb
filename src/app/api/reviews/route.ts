import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET all weekly reviews
export async function GET() {
  try {
    const reviews = await db.weeklyReview.findMany({
      orderBy: { weekStartDate: 'desc' },
    });
    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching weekly reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weekly reviews' },
      { status: 500 }
    );
  }
}

// POST create a new weekly review
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { weekStartDate, wins, learnings, challenges, nextGoals } = body;

    if (!weekStartDate) {
      return NextResponse.json(
        { error: 'weekStartDate is required' },
        { status: 400 }
      );
    }

    const review = await db.weeklyReview.create({
      data: {
        weekStartDate: new Date(weekStartDate),
        wins: wins ?? '',
        learnings: learnings ?? '',
        challenges: challenges ?? '',
        nextGoals: nextGoals ?? '',
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Error creating weekly review:', error);
    return NextResponse.json(
      { error: 'Failed to create weekly review' },
      { status: 500 }
    );
  }
}

// PUT update a weekly review
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, weekStartDate, wins, learnings, challenges, nextGoals } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Weekly review id is required' },
        { status: 400 }
      );
    }

    const review = await db.weeklyReview.update({
      where: { id },
      data: {
        ...(weekStartDate !== undefined && {
          weekStartDate: new Date(weekStartDate),
        }),
        ...(wins !== undefined && { wins }),
        ...(learnings !== undefined && { learnings }),
        ...(challenges !== undefined && { challenges }),
        ...(nextGoals !== undefined && { nextGoals }),
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error('Error updating weekly review:', error);
    return NextResponse.json(
      { error: 'Failed to update weekly review' },
      { status: 500 }
    );
  }
}

// DELETE a weekly review
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Weekly review id is required' },
        { status: 400 }
      );
    }

    await db.weeklyReview.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting weekly review:', error);
    return NextResponse.json(
      { error: 'Failed to delete weekly review' },
      { status: 500 }
    );
  }
}
