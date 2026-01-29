import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
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
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipe' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Check if recipe exists
    const recipe = await prisma.recipe.findUnique({
      where: { id },
    });

    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    // Delete ratings for this recipe
    await prisma.rating.deleteMany({
      where: { recipeId: id },
    });

    // Delete meal plan recipe associations
    await prisma.mealPlanRecipe.deleteMany({
      where: { recipeId: id },
    });

    // Delete the recipe
    await prisma.recipe.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Recipe deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    return NextResponse.json(
      { error: 'Failed to delete recipe' },
      { status: 500 }
    );
  }
}
