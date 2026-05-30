import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET all learning categories
export async function GET() {
  try {
    const categories = await db.learningCategory.findMany({
      include: {
        _count: {
          select: { items: true },
        },
      },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching learning categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch learning categories' },
      { status: 500 }
    );
  }
}

// POST create a new learning category
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, color } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    const category = await db.learningCategory.create({
      data: {
        name,
        color: color ?? '#6366f1',
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating learning category:', error);
    return NextResponse.json(
      { error: 'Failed to create learning category' },
      { status: 500 }
    );
  }
}
