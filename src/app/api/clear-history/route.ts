import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function DELETE() {
  try {
    // Only delete meal plan associations and meal plans
    // Recipes are preserved

    // Delete meal plan recipes (the associations)
    await prisma.mealPlanRecipe.deleteMany({});

    // Delete meal plans
    await prisma.mealPlan.deleteMany({});

    return NextResponse.json({
      success: true,
      message: 'All meal plans have been deleted (recipes preserved)'
    });
  } catch (error) {
    console.error('Error clearing history:', error);
    return NextResponse.json(
      { error: 'Failed to clear history' },
      { status: 500 }
    );
  }
}
