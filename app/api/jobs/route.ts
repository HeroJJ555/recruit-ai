import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/jobs - Get active job openings for candidate application
export async function GET(req: NextRequest) {
  try {
    const jobModel = (prisma as any).job
    if (!jobModel) {
      return NextResponse.json({ error: "Model Job nie jest dostępny" }, { status: 500 })
    }

    // Get only OPEN jobs for candidates to apply to
    const jobs = await jobModel.findMany({
      where: { 
        status: "OPEN",
        publishedAt: { not: null }
      },
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        title: true,
        department: true,
        location: true,
        employmentType: true,
        seniority: true,
      }
    })

    return NextResponse.json(jobs)
  } catch (error) {
    console.error("Error fetching jobs:", error)
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 })
  }
}