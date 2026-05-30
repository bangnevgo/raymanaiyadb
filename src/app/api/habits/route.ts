import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

function thirtyDaysAgo(): Date {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  d.setHours(0, 0, 0, 0);
  return d;
}

// GET all habits with entries for the last 30 days
export async function GET() {
  try {
    const habits = await db.habit.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        entries: {
          where: {
            date: { gte: thirtyDaysAgo() },
          },
          orderBy: { date: 'asc' },
        },
      },
    });
    return NextResponse.json(habits);
  } catch (error) {
    console.error('Error fetching habits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch habits' },
      { status: 500 }
    );
  }
}

// POST create a new habit
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, emoji, frequency, color } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const habit = await db.habit.create({
      data: {
        title: title.trim(),
        emoji: emoji || '✅',
        frequency: frequency || 'daily',
        color: color || '#6366f1',
      },
    });

    return NextResponse.json(habit, { status: 201 });
  } catch (error) {
    console.error('Error creating habit:', error);
    return NextResponse.json(
      { error: 'Failed to create habit' },
      { status: 500 }
    );
  }
}

// PUT update a habit
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, title, emoji, frequency, color } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Habit id is required' },
        { status: 400 }
      );
    }

    const habit = await db.habit.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(emoji !== undefined && { emoji }),
        ...(frequency !== undefined && { frequency }),
        ...(color !== undefined && { color }),
      },
    });

    return NextResponse.json(habit);
  } catch (error) {
    console.error('Error updating habit:', error);
    return NextResponse.json(
      { error: 'Failed to update habit' },
      { status: 500 }
    );
  }
}

// DELETE a habit
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Habit id is required' },
        { status: 400 }
      );
    }

    await db.habit.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting habit:', error);
    return NextResponse.json(
      { error: 'Failed to delete habit' },
      { status: 500 }
    );
  }
}
