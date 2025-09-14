import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Allowed statuses consistent with ApplicationStatus enum in schema.prisma
const ALLOWED: Set<string> = new Set([
  'PENDING','REVIEWED','CONTACTED','INTERVIEW_SCHEDULED','INTERVIEW_COMPLETED','REJECTED','HIRED','WAITING','INTERVIEW','WITHDRAWN'
]);

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { status } = body as { status?: string };
    if (!status || !ALLOWED.has(status)) {
      return NextResponse.json({ error: 'Invalid status', allowed: Array.from(ALLOWED) }, { status: 400 });
    }

    const updated = await prisma.candidateApplication.update({
      where: { id: params.id },
      data: { status }
    });

    return NextResponse.json({ success: true, id: updated.id, status: updated.status });
  } catch (e: any) {
    console.error('Status PATCH error', e);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}