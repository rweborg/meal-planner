import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');

  if (id) {
    const recipe = await prisma.recipe.findUnique({
      where: { id },
      include: {
        ratings: {
          include: {
            familyMember: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!recipe) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(recipe);
  }

  const recipes = await prisma.recipe.findMany({
    include: {
      ratings: true,
    },
    orderBy: {
      generatedAt: 'desc',
    },
  });

  return NextResponse.json(recipes);
}
