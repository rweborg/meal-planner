import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { recipes } = body;

  if (!Array.isArray(recipes) || recipes.length === 0) {
    return NextResponse.json(
      { error: 'recipes array is required' },
      { status: 400 }
    );
  }

  const weekStart = getWeekStart(new Date());

  // Create meal plan with recipes assigned to each day
  const mealPlan = await prisma.mealPlan.create({
    data: {
      weekStart,
      recipes: {
        create: recipes.slice(0, 7).map((recipe: { id: string }, index: number) => ({
          recipeId: recipe.id,
          dayOfWeek: index,
          mealType: 'dinner',
        })),
      },
    },
    include: {
      recipes: {
        include: {
          recipe: true,
        },
      },
    },
  });

  return NextResponse.json(mealPlan, { status: 201 });
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  const current = searchParams.get('current');

  if (id) {
    const mealPlan = await prisma.mealPlan.findUnique({
      where: { id },
      include: {
        recipes: {
          include: {
            recipe: true,
          },
        },
      },
    });

    if (!mealPlan) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(mealPlan);
  }

  if (current === 'true') {
    const weekStart = getWeekStart(new Date());
    const mealPlan = await prisma.mealPlan.findFirst({
      where: {
        weekStart: {
          gte: weekStart,
          lt: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000),
        },
      },
      include: {
        recipes: {
          include: {
            recipe: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(mealPlan);
  }

  const mealPlans = await prisma.mealPlan.findMany({
    include: {
      recipes: {
        include: {
          recipe: true,
        },
      },
    },
    orderBy: {
      weekStart: 'desc',
    },
  });

  return NextResponse.json(mealPlans);
}
