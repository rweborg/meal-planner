import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function DELETE() {
  try {
    // Delete in order to respect foreign key constraints

    // First delete ratings (they reference recipes)
    await prisma.rating.deleteMany({});

    // Delete meal plan recipes (they reference recipes)
    await prisma.mealPlanRecipe.deleteMany({});

    // Delete meal plans (now empty)
    await prisma.mealPlan.deleteMany({});

    // Delete all recipes
    await prisma.recipe.deleteMany({});

    return NextResponse.json({
      success: true,
      message: 'All recipes have been deleted'
    });
  } catch (error) {
    console.error('Error clearing recipes:', error);
    return NextResponse.json(
      { error: 'Failed to clear recipes' },
      { status: 500 }
    );
  }
}
