import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  const current = searchParams.get('current');

  try {
    if (id) {
      const job = await prisma.generationJob.findUnique({
        where: { id },
      });
      if (!job) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      return NextResponse.json({
        id: job.id,
        status: job.status,
        step: job.step,
        stepMessage: job.stepMessage,
        totalSteps: job.totalSteps,
        error: job.error,
        mealPlanId: job.mealPlanId,
      });
    }

    if (current === 'true') {
      const job = await prisma.generationJob.findFirst({
        where: { status: { in: ['pending', 'running', 'failed'] } },
        orderBy: { createdAt: 'desc' },
      });
      if (!job) {
        return NextResponse.json(null);
      }
      return NextResponse.json({
        id: job.id,
        status: job.status,
        step: job.step,
        stepMessage: job.stepMessage,
        totalSteps: job.totalSteps,
        error: job.error,
        mealPlanId: job.mealPlanId,
      });
    }

    return NextResponse.json({ error: 'id or current query param required' }, { status: 400 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Get job error:', err);
    return NextResponse.json(
      { error: `Failed to get job: ${msg}` },
      { status: 500 }
    );
  }
}
