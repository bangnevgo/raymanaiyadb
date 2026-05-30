import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET all North Star Goals
export async function GET() {
  try {
    const goals = await db.northStarGoal.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(goals);
  } catch (error) {
    console.error('Error fetching goals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch goals' },
      { status: 500 }
    );
  }
}

// POST create a new North Star Goal
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, target, current, deadline } = body;

    if (!title || target === undefined) {
      return NextResponse.json(
        { error: 'Title and target are required' },
        { status: 400 }
      );
    }

    const goal = await db.northStarGoal.create({
      data: {
        title,
        target,
        current: current ?? 0,
        deadline: deadline ? new Date(deadline) : null,
      },
    });

    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    console.error('Error creating goal:', error);
    return NextResponse.json(
      { error: 'Failed to create goal' },
      { status: 500 }
    );
  }
}

// PUT update a North Star Goal
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, title, target, current, deadline } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Goal id is required' },
        { status: 400 }
      );
    }

    const goal = await db.northStarGoal.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(target !== undefined && { target }),
        ...(current !== undefined && { current }),
        ...(deadline !== undefined && {
          deadline: deadline ? new Date(deadline) : null,
        }),
      },
    });

    return NextResponse.json(goal);
  } catch (error) {
    console.error('Error updating goal:', error);
    return NextResponse.json(
      { error: 'Failed to update goal' },
      { status: 500 }
    );
  }
}

// DELETE a North Star Goal
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Goal id is required' },
        { status: 400 }
      );
    }

    await db.northStarGoal.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting goal:', error);
    return NextResponse.json(
      { error: 'Failed to delete goal' },
      { status: 500 }
    );
  }
}
