import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET all journal entries
export async function GET() {
  try {
    const entries = await db.journalEntry.findMany({
      orderBy: { date: 'desc' },
    });
    return NextResponse.json(entries);
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch journal entries' },
      { status: 500 }
    );
  }
}

// POST create a new journal entry
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, reflection, mood, energyLevel } = body;

    if (!date || !reflection) {
      return NextResponse.json(
        { error: 'Date and reflection are required' },
        { status: 400 }
      );
    }

    const entry = await db.journalEntry.create({
      data: {
        date: new Date(date),
        reflection,
        mood: mood ?? 'Neutral',
        energyLevel: energyLevel ?? 5,
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error('Error creating journal entry:', error);
    return NextResponse.json(
      { error: 'Failed to create journal entry' },
      { status: 500 }
    );
  }
}

// PUT update a journal entry
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, date, reflection, mood, energyLevel } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Journal entry id is required' },
        { status: 400 }
      );
    }

    const entry = await db.journalEntry.update({
      where: { id },
      data: {
        ...(date !== undefined && { date: new Date(date) }),
        ...(reflection !== undefined && { reflection }),
        ...(mood !== undefined && { mood }),
        ...(energyLevel !== undefined && { energyLevel }),
      },
    });

    return NextResponse.json(entry);
  } catch (error) {
    console.error('Error updating journal entry:', error);
    return NextResponse.json(
      { error: 'Failed to update journal entry' },
      { status: 500 }
    );
  }
}

// DELETE a journal entry
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Journal entry id is required' },
        { status: 400 }
      );
    }

    await db.journalEntry.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete journal entry' },
      { status: 500 }
    );
  }
}
