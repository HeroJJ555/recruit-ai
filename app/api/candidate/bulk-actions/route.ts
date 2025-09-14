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

    if (!action || !['reject', 'waiting', 'interview', 'hired', 'withdrawn'].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    // Update candidate statuses
    const updateResult = await prisma.candidateApplication.updateMany({
      where: {
        id: {
          in: candidateIds
        }
      },
      data: {
        status: action,
        updatedAt: new Date()
      }
    })

    // Log the bulk action
    console.log(`Bulk action performed: ${action} on ${updateResult.count} candidates by user ${session.user?.email}`)

    return NextResponse.json({ 
      success: true, 
      message: `Successfully updated ${updateResult.count} candidates to status: ${action}`,
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