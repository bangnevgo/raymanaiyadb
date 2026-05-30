import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST toggle a habit entry for a specific date
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { habitId, date } = body;

    if (!habitId || !date) {
      return NextResponse.json(
        { error: 'habitId and date are required' },
        { status: 400 }
      );
    }

    const entryDate = new Date(date);
    entryDate.setHours(0, 0, 0, 0);

    // Check if entry already exists
    const existing = await db.habitEntry.findUnique({
      where: {
        habitId_date: {
          habitId,
          date: entryDate,
        },
      },
    });

    let entry;

    if (existing) {
      // Flip the completed boolean
      entry = await db.habitEntry.update({
        where: { id: existing.id },
        data: { completed: !existing.completed },
      });
    } else {
      // Create new entry with completed=true
      entry = await db.habitEntry.create({
        data: {
          habitId,
          date: entryDate,
          completed: true,
        },
      });
    }

    return NextResponse.json(entry);
  } catch (error) {
    console.error('Error toggling habit entry:', error);
    return NextResponse.json(
      { error: 'Failed to toggle habit entry' },
      { status: 500 }
    );
  }
}
