import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { runGenerationJob } from '@/lib/generateMealPlan';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { mealCount = 7 } = body;

    const existing = await prisma.generationJob.findFirst({
      where: { status: { in: ['pending', 'running'] } },
      orderBy: { createdAt: 'desc' },
    });

    if (existing) {
      return NextResponse.json({ jobId: existing.id });
    }

    const job = await prisma.generationJob.create({
      data: {
        status: 'pending',
        step: 0,
        totalSteps: 9,
      },
    });

    runGenerationJob(job.id).catch((err) => {
      console.error('Background job failed:', err);
    });

    return NextResponse.json({ jobId: job.id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Start generation error:', err);
    return NextResponse.json(
      { error: `Failed to start generation: ${msg}` },
      { status: 500 }
    );
  }
}
