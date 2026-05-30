import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET all certifications
export async function GET() {
  try {
    const certifications = await db.certification.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(certifications);
  } catch (error) {
    console.error('Error fetching certifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch certifications' },
      { status: 500 }
    );
  }
}

// POST create a new certification
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, provider, startDate, targetCompletion, completionPct, certificateUrl, status } = body;

    if (!name || !provider) {
      return NextResponse.json(
        { error: 'Name and provider are required' },
        { status: 400 }
      );
    }

    const certification = await db.certification.create({
      data: {
        name,
        provider,
        startDate: startDate ? new Date(startDate) : null,
        targetCompletion: targetCompletion ? new Date(targetCompletion) : null,
        completionPct: completionPct ?? 0,
        certificateUrl,
        status: status ?? 'Planned',
      },
    });

    return NextResponse.json(certification, { status: 201 });
  } catch (error) {
    console.error('Error creating certification:', error);
    return NextResponse.json(
      { error: 'Failed to create certification' },
      { status: 500 }
    );
  }
}

// PUT update a certification
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, provider, startDate, targetCompletion, completionPct, certificateUrl, status } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Certification id is required' },
        { status: 400 }
      );
    }

    const certification = await db.certification.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(provider !== undefined && { provider }),
        ...(startDate !== undefined && {
          startDate: startDate ? new Date(startDate) : null,
        }),
        ...(targetCompletion !== undefined && {
          targetCompletion: targetCompletion ? new Date(targetCompletion) : null,
        }),
        ...(completionPct !== undefined && { completionPct }),
        ...(certificateUrl !== undefined && { certificateUrl }),
        ...(status !== undefined && { status }),
      },
    });

    return NextResponse.json(certification);
  } catch (error) {
    console.error('Error updating certification:', error);
    return NextResponse.json(
      { error: 'Failed to update certification' },
      { status: 500 }
    );
  }
}

// DELETE a certification
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Certification id is required' },
        { status: 400 }
      );
    }

    await db.certification.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting certification:', error);
    return NextResponse.json(
      { error: 'Failed to delete certification' },
      { status: 500 }
    );
  }
}
