import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET all portfolio projects
export async function GET() {
  try {
    const projects = await db.portfolioProject.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching portfolio projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio projects' },
      { status: 500 }
    );
  }
}

// POST create a new portfolio project
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, skillsUsed, aiUsed, link, completionDate, status } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Project title is required' },
        { status: 400 }
      );
    }

    const project = await db.portfolioProject.create({
      data: {
        title,
        description,
        skillsUsed: skillsUsed ? JSON.stringify(skillsUsed) : null,
        aiUsed: aiUsed ? JSON.stringify(aiUsed) : null,
        link,
        completionDate: completionDate ? new Date(completionDate) : null,
        status: status ?? 'Idea',
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Error creating portfolio project:', error);
    return NextResponse.json(
      { error: 'Failed to create portfolio project' },
      { status: 500 }
    );
  }
}

// PUT update a portfolio project
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, title, description, skillsUsed, aiUsed, link, completionDate, status } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Project id is required' },
        { status: 400 }
      );
    }

    const project = await db.portfolioProject.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(skillsUsed !== undefined && {
          skillsUsed: skillsUsed ? JSON.stringify(skillsUsed) : null,
        }),
        ...(aiUsed !== undefined && {
          aiUsed: aiUsed ? JSON.stringify(aiUsed) : null,
        }),
        ...(link !== undefined && { link }),
        ...(completionDate !== undefined && {
          completionDate: completionDate ? new Date(completionDate) : null,
        }),
        ...(status !== undefined && { status }),
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error updating portfolio project:', error);
    return NextResponse.json(
      { error: 'Failed to update portfolio project' },
      { status: 500 }
    );
  }
}

// DELETE a portfolio project
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Project id is required' },
        { status: 400 }
      );
    }

    await db.portfolioProject.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting portfolio project:', error);
    return NextResponse.json(
      { error: 'Failed to delete portfolio project' },
      { status: 500 }
    );
  }
}
