import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    console.log('=== Test endpoint called ===')
    
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      console.log('No session found')
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log('Session found:', session.user?.email)

    const body = await req.json()
    console.log('Request body:', body)

    return NextResponse.json({ 
      answer: "Test response - Gradio is working!",
      model: "test",
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Test endpoint error:', error)
    return NextResponse.json({ 
      error: "Test endpoint failed",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}