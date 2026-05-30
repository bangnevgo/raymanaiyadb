import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET all networking connections
export async function GET() {
  try {
    const connections = await db.networkingConnection.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(connections);
  } catch (error) {
    console.error('Error fetching networking connections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch networking connections' },
      { status: 500 }
    );
  }
}

// POST create a new networking connection
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, company, role, platform, connectionDate, lastInteraction, notes } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Connection name is required' },
        { status: 400 }
      );
    }

    const connection = await db.networkingConnection.create({
      data: {
        name,
        company,
        role,
        platform: platform ?? 'LinkedIn',
        connectionDate: connectionDate ? new Date(connectionDate) : null,
        lastInteraction: lastInteraction ? new Date(lastInteraction) : null,
        notes,
      },
    });

    return NextResponse.json(connection, { status: 201 });
  } catch (error) {
    console.error('Error creating networking connection:', error);
    return NextResponse.json(
      { error: 'Failed to create networking connection' },
      { status: 500 }
    );
  }
}

// PUT update a networking connection
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, company, role, platform, connectionDate, lastInteraction, notes } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Connection id is required' },
        { status: 400 }
      );
    }

    const connection = await db.networkingConnection.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(company !== undefined && { company }),
        ...(role !== undefined && { role }),
        ...(platform !== undefined && { platform }),
        ...(connectionDate !== undefined && {
          connectionDate: connectionDate ? new Date(connectionDate) : null,
        }),
        ...(lastInteraction !== undefined && {
          lastInteraction: lastInteraction ? new Date(lastInteraction) : null,
        }),
        ...(notes !== undefined && { notes }),
      },
    });

    return NextResponse.json(connection);
  } catch (error) {
    console.error('Error updating networking connection:', error);
    return NextResponse.json(
      { error: 'Failed to update networking connection' },
      { status: 500 }
    );
  }
}

// DELETE a networking connection
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Connection id is required' },
        { status: 400 }
      );
    }

    await db.networkingConnection.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting networking connection:', error);
    return NextResponse.json(
      { error: 'Failed to delete networking connection' },
      { status: 500 }
    );
  }
}
