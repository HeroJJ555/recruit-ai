import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

  const { candidateIds, action } = await req.json()

    if (!candidateIds || !Array.isArray(candidateIds) || candidateIds.length === 0) {
      return NextResponse.json({ error: "candidateIds array is required" }, { status: 400 })
    }

    // Normalize action to accepted internal values (lowercase)
    const normalizeAction = (raw: unknown): string | null => {
      if (!raw) return null
      const s = String(raw).trim().toLowerCase()
      if (["reject", "rejected"].includes(s)) return "rejected"
      if (["wait", "waiting", "pending"].includes(s)) return "waiting"
      if (["interview", "interview_scheduled", "interview-completed", "interview_completed"].includes(s)) return "interview"
      if (["hired"].includes(s)) return "hired"
      if (["withdraw", "withdrawn"].includes(s)) return "withdrawn"
      return null
    }

    const normalizedAction = normalizeAction(action)
    if (!normalizedAction) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    // Map to Prisma enum values (uppercase)
    const toPrismaStatus = (s: string): string => {
      switch (s) {
        case 'rejected':
          return 'REJECTED'
        case 'waiting':
          return 'WAITING'
        case 'interview':
          return 'INTERVIEW'
        case 'hired':
          return 'HIRED'
        case 'withdrawn':
          return 'WITHDRAWN'
        default:
          return 'PENDING'
      }
    }

    const prismaStatus = toPrismaStatus(normalizedAction)

    // Update candidate statuses
    const updateResult = await prisma.candidateApplication.updateMany({
      where: {
        id: {
          in: candidateIds
        }
      },
      data: ({
        status: prismaStatus,
        updatedAt: new Date()
      } as any)
    })

    // Log the bulk action
    console.log(`Bulk action performed: ${normalizedAction} on ${updateResult.count} candidates by user ${session.user?.email}`)

    return NextResponse.json({ 
      success: true, 
      message: `Successfully updated ${updateResult.count} candidates to status: ${prismaStatus}`,
      updatedCount: updateResult.count
    })

  } catch (error) {
    console.error("Bulk action error:", error)
    return NextResponse.json(
      { error: "Failed to perform bulk action" },
      { status: 500 }
    )
  }
}