import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');

  if (id) {
    const member = await prisma.familyMember.findUnique({
      where: { id },
      include: {
        preferences: true,
      },
    });

    if (!member) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(member);
  }

  const members = await prisma.familyMember.findMany({
    include: {
      _count: {
        select: { preferences: true },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  return NextResponse.json(members);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name } = body;

  if (!name || typeof name !== 'string') {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const member = await prisma.familyMember.create({
    data: { name },
  });

  return NextResponse.json(member, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  await prisma.familyMember.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
