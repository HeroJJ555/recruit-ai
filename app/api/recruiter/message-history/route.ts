import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    console.log("📧 Message History API: Fetching message history");
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const candidateId = searchParams.get('candidateId');

    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (status) {
      where.status = status.toUpperCase();
    }
    if (candidateId) {
      where.candidateApplicationId = candidateId;
    }

    // Fetch message history with candidate information
    const [messages, totalCount] = await Promise.all([
      prisma.messageHistory.findMany({
        where,
        include: {
          candidateApplication: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              position: true
            }
          },
          senderUser: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          sentAt: 'desc'
        },
        skip: offset,
        take: limit
      }),
      prisma.messageHistory.count({ where })
    ]);

    // Transform data for frontend
    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      subject: msg.subject,
      content: msg.content,
      template: msg.template,
      status: msg.status,
      sentAt: msg.sentAt,
      deliveredAt: msg.deliveredAt,
      errorMessage: msg.errorMessage,
      mailProvider: msg.mailProvider,
      externalMessageId: msg.externalMessageId,
      candidate: {
        id: msg.candidateApplication.id,
        name: `${msg.candidateApplication.firstName} ${msg.candidateApplication.lastName}`,
        email: msg.candidateApplication.email,
        position: msg.candidateApplication.position
      },
      sender: msg.senderUser ? {
        id: msg.senderUser.id,
        name: msg.senderUser.name,
        email: msg.senderUser.email
      } : null
    }));

    const totalPages = Math.ceil(totalCount / limit);

    console.log(`✅ Found ${messages.length} message history entries`);

    return NextResponse.json({
      messages: formattedMessages,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });

  } catch (error) {
    console.error("❌ Error fetching message history:", error);
    return NextResponse.json(
      { error: "Failed to fetch message history" },
      { status: 500 }
    );
  }
}