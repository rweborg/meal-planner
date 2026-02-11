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
  const recipeIds = recipes.slice(0, 7).map((r: { id?: string }) => r?.id).filter(Boolean);
  if (recipeIds.length === 0) {
    return NextResponse.json(
      { error: 'Each recipe must have an id. Got: ' + JSON.stringify(recipes.slice(0, 1)) },
      { status: 400 }
    );
  }

  try {
    const mealPlan = await prisma.mealPlan.create({
      data: {
        weekStart,
        recipes: {
          create: recipeIds.map((recipeId, index) => ({
            recipeId,
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
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Meal plan create error:', err);
    return NextResponse.json(
      { error: 'Could not create meal plan: ' + msg },
      { status: 500 }
    );
  }
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
