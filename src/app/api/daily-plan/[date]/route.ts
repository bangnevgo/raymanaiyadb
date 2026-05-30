import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET a DailyPlan by date (YYYY-MM-DD)
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ date: string }> }
) {
  try {
    const { date } = await params;
    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);

    const plan = await db.dailyPlan.findFirst({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        timeBlocks: { orderBy: { startTime: 'asc' } },
        tasks: { orderBy: { createdAt: 'asc' } },
      },
    });

    return NextResponse.json(plan);
  } catch (error) {
    console.error('Error fetching daily plan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily plan' },
      { status: 500 }
    );
  }
}

// POST create a new DailyPlan for a date
export async function POST(
  request: Request,
  { params }: { params: Promise<{ date: string }> }
) {
  try {
    const { date } = await params;
    const body = await request.json();
    const { priority1, priority2, priority3, notes, reflection } = body;

    const dayDate = new Date(`${date}T00:00:00.000Z`);

    const plan = await db.dailyPlan.create({
      data: {
        date: dayDate,
        priority1,
        priority2,
        priority3,
        notes,
        reflection,
      },
    });

    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    console.error('Error creating daily plan:', error);
    return NextResponse.json(
      { error: 'Failed to create daily plan' },
      { status: 500 }
    );
  }
}

// PUT update a DailyPlan by date
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ date: string }> }
) {
  try {
    const { date } = await params;
    const body = await request.json();
    const { priority1, priority2, priority3, notes, reflection } = body;

    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);

    const existing = await db.dailyPlan.findFirst({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Daily plan not found for this date' },
        { status: 404 }
      );
    }

    const plan = await db.dailyPlan.update({
      where: { id: existing.id },
      data: {
        ...(priority1 !== undefined && { priority1 }),
        ...(priority2 !== undefined && { priority2 }),
        ...(priority3 !== undefined && { priority3 }),
        ...(notes !== undefined && { notes }),
        ...(reflection !== undefined && { reflection }),
      },
    });

    return NextResponse.json(plan);
  } catch (error) {
    console.error('Error updating daily plan:', error);
    return NextResponse.json(
      { error: 'Failed to update daily plan' },
      { status: 500 }
    );
  }
}
