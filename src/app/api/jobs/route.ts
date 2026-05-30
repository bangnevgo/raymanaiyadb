import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET all job applications
export async function GET() {
  try {
    const jobs = await db.jobApplication.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Error fetching job applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job applications' },
      { status: 500 }
    );
  }
}

// POST create a new job application
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { company, position, country, salaryRange, jobLink, applicationDate, status, notes } = body;

    if (!company || !position) {
      return NextResponse.json(
        { error: 'Company and position are required' },
        { status: 400 }
      );
    }

    const job = await db.jobApplication.create({
      data: {
        company,
        position,
        country,
        salaryRange,
        jobLink,
        applicationDate: applicationDate ? new Date(applicationDate) : null,
        status: status ?? 'Wishlist',
        notes,
      },
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error('Error creating job application:', error);
    return NextResponse.json(
      { error: 'Failed to create job application' },
      { status: 500 }
    );
  }
}

// PUT update a job application
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, company, position, country, salaryRange, jobLink, applicationDate, status, notes } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Job application id is required' },
        { status: 400 }
      );
    }

    const job = await db.jobApplication.update({
      where: { id },
      data: {
        ...(company !== undefined && { company }),
        ...(position !== undefined && { position }),
        ...(country !== undefined && { country }),
        ...(salaryRange !== undefined && { salaryRange }),
        ...(jobLink !== undefined && { jobLink }),
        ...(applicationDate !== undefined && {
          applicationDate: applicationDate ? new Date(applicationDate) : null,
        }),
        ...(status !== undefined && { status }),
        ...(notes !== undefined && { notes }),
      },
    });

    return NextResponse.json(job);
  } catch (error) {
    console.error('Error updating job application:', error);
    return NextResponse.json(
      { error: 'Failed to update job application' },
      { status: 500 }
    );
  }
}

// DELETE a job application
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Job application id is required' },
        { status: 400 }
      );
    }

    await db.jobApplication.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting job application:', error);
    return NextResponse.json(
      { error: 'Failed to delete job application' },
      { status: 500 }
    );
  }
}
