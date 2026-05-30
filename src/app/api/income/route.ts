import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET all income entries
export async function GET() {
  try {
    const income = await db.incomeEntry.findMany({
      orderBy: { date: 'desc' },
    });
    return NextResponse.json(income);
  } catch (error) {
    console.error('Error fetching income entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch income entries' },
      { status: 500 }
    );
  }
}

// POST create a new income entry
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, source, category, amount, notes } = body;

    if (!date || !source || amount === undefined) {
      return NextResponse.json(
        { error: 'Date, source, and amount are required' },
        { status: 400 }
      );
    }

    const entry = await db.incomeEntry.create({
      data: {
        date: new Date(date),
        source,
        category: category ?? 'Freelance',
        amount: Number(amount),
        notes,
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error('Error creating income entry:', error);
    return NextResponse.json(
      { error: 'Failed to create income entry' },
      { status: 500 }
    );
  }
}

// PUT update an income entry
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, date, source, category, amount, notes } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Income entry id is required' },
        { status: 400 }
      );
    }

    const entry = await db.incomeEntry.update({
      where: { id },
      data: {
        ...(date !== undefined && { date: new Date(date) }),
        ...(source !== undefined && { source }),
        ...(category !== undefined && { category }),
        ...(amount !== undefined && { amount: Number(amount) }),
        ...(notes !== undefined && { notes }),
      },
    });

    return NextResponse.json(entry);
  } catch (error) {
    console.error('Error updating income entry:', error);
    return NextResponse.json(
      { error: 'Failed to update income entry' },
      { status: 500 }
    );
  }
}

// DELETE an income entry
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Income entry id is required' },
        { status: 400 }
      );
    }

    await db.incomeEntry.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting income entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete income entry' },
      { status: 500 }
    );
  }
}
