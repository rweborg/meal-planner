import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Check if meal plan exists
    const mealPlan = await prisma.mealPlan.findUnique({
      where: { id },
    });

    if (!mealPlan) {
      return NextResponse.json(
        { error: 'Meal plan not found' },
        { status: 404 }
      );
    }

    // Delete meal plan recipes (the associations, not the recipes themselves)
    await prisma.mealPlanRecipe.deleteMany({
      where: {
        mealPlanId: id,
      },
    });

    // Delete the meal plan
    await prisma.mealPlan.delete({
      where: { id },
    });

    // Recipes are kept - they can still be viewed in the Recipes page

    return NextResponse.json({
      success: true,
      message: 'Meal plan deleted successfully (recipes preserved)',
    });
  } catch (error) {
    console.error('Error deleting meal plan:', error);
    return NextResponse.json(
      { error: 'Failed to delete meal plan' },
      { status: 500 }
    );
  }
}
