import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { recalculateAllRecipeScores } from '@/lib/recalculateScores';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { familyMemberId, preferences } = body;

  if (!familyMemberId || !Array.isArray(preferences)) {
    return NextResponse.json(
      { error: 'familyMemberId and preferences array are required' },
      { status: 400 }
    );
  }

  // Delete existing preferences for this member
  await prisma.preference.deleteMany({
    where: { familyMemberId },
  });

  // Create new preferences
  if (preferences.length > 0) {
    await prisma.preference.createMany({
      data: preferences.map((p: { category: string; value: string }) => ({
        familyMemberId,
        category: p.category,
        value: p.value,
      })),
    });
  }

  // Recalculate all recipe match scores with updated preferences
  try {
    const result = await recalculateAllRecipeScores();
    console.log(`Recalculated match scores for ${result.updated} recipes`);
  } catch (error) {
    console.error('Error recalculating recipe scores:', error);
    // Don't fail the request if recalculation fails - preferences were saved successfully
  }

  return NextResponse.json({ success: true });
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const familyMemberId = searchParams.get('familyMemberId');

  if (familyMemberId) {
    const preferences = await prisma.preference.findMany({
      where: { familyMemberId },
    });
    return NextResponse.json(preferences);
  }

  const preferences = await prisma.preference.findMany({
    include: {
      familyMember: true,
    },
  });

  return NextResponse.json(preferences);
}
