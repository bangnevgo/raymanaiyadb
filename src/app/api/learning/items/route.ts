import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET all learning items with their category
export async function GET() {
  try {
    const items = await db.learningItem.findMany({
      include: {
        category: {
          select: { id: true, name: true, color: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching learning items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch learning items' },
      { status: 500 }
    );
  }
}

// POST create a new learning item
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, categoryId, progress, hoursSpent, notes, streak, lastStudied } = body;

    if (!title || !categoryId) {
      return NextResponse.json(
        { error: 'Title and categoryId are required' },
        { status: 400 }
      );
    }

    const item = await db.learningItem.create({
      data: {
        title,
        categoryId,
        progress: progress ?? 0,
        hoursSpent: hoursSpent ?? 0,
        notes,
        streak: streak ?? 0,
        lastStudied: lastStudied ? new Date(lastStudied) : null,
      },
      include: {
        category: {
          select: { id: true, name: true, color: true },
        },
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Error creating learning item:', error);
    return NextResponse.json(
      { error: 'Failed to create learning item' },
      { status: 500 }
    );
  }
}

// PUT update a learning item
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, title, categoryId, progress, hoursSpent, notes, streak, lastStudied } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Item id is required' },
        { status: 400 }
      );
    }

    const item = await db.learningItem.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(categoryId !== undefined && { categoryId }),
        ...(progress !== undefined && { progress }),
        ...(hoursSpent !== undefined && { hoursSpent }),
        ...(notes !== undefined && { notes }),
        ...(streak !== undefined && { streak }),
        ...(lastStudied !== undefined && {
          lastStudied: lastStudied ? new Date(lastStudied) : null,
        }),
      },
      include: {
        category: {
          select: { id: true, name: true, color: true },
        },
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error updating learning item:', error);
    return NextResponse.json(
      { error: 'Failed to update learning item' },
      { status: 500 }
    );
  }
}

// DELETE a learning item
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Item id is required' },
        { status: 400 }
      );
    }

    await db.learningItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting learning item:', error);
    return NextResponse.json(
      { error: 'Failed to delete learning item' },
      { status: 500 }
    );
  }
}
