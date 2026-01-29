import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { recipeId, familyMemberId, score, comment } = body;

  if (!recipeId || !familyMemberId || !score) {
    return NextResponse.json(
      { error: 'recipeId, familyMemberId, and score are required' },
      { status: 400 }
    );
  }

  if (score < 1 || score > 5) {
    return NextResponse.json(
      { error: 'Score must be between 1 and 5' },
      { status: 400 }
    );
  }

  const rating = await prisma.rating.create({
    data: {
      recipeId,
      familyMemberId,
      score,
      comment,
    },
    include: {
      familyMember: true,
      recipe: true,
    },
  });

  return NextResponse.json(rating, { status: 201 });
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const recipeId = searchParams.get('recipeId');

  if (recipeId) {
    const ratings = await prisma.rating.findMany({
      where: { recipeId },
      include: {
        familyMember: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(ratings);
  }

  const ratings = await prisma.rating.findMany({
    include: {
      familyMember: true,
      recipe: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return NextResponse.json(ratings);
}
