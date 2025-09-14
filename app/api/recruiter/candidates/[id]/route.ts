import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Single delete relies on onDelete: Cascade relations defined in schema (Meeting.candidate, MessageHistory.candidateApplication, CvAnalysis.candidateApplication)
    await prisma.candidateApplication.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('Candidate DELETE error', e);
    return NextResponse.json({ error: 'Failed to delete candidate' }, { status: 500 });
  }
}