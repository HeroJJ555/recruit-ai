import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get current date for monthly calculations
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Parallel queries for better performance
    const [
      totalCandidates,
      candidatesThisMonth,
      openJobs,
      analysisStats
    ] = await Promise.all([
      // Total candidates count
      prisma.candidateApplication.count(),
      
      // Candidates this month count
      prisma.candidateApplication.count({
        where: {
          createdAt: {
            gte: startOfMonth
          }
        }
      }),
      
      // Open jobs count
      prisma.job.count({
        where: {
          status: 'OPEN'
        }
      }),
      
      // Analysis statistics
      prisma.cvAnalysis.aggregate({
        _avg: {
          matchScore: true
        },
        _count: {
          id: true
        }
      })
    ])

    const averageMatchScore = analysisStats._avg.matchScore || 0
    const analyzedCandidates = analysisStats._count.id || 0

    return NextResponse.json({
      totalCandidates,
      candidatesThisMonth,
      openJobs,
      averageMatchScore,
      analyzedCandidates
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    )
  }
}