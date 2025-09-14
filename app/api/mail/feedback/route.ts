import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Resend } from 'resend';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

interface MailRequest {
  to: string;
  candidateId: string;
  candidateName: string;
  position: string;
  subject: string;
  message: string;
  template: string;
}

export async function POST(req: NextRequest) {
  try {
    console.log("📧 Mail API: Received request");
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json() as MailRequest;
    const { to, candidateId, candidateName, position, subject, message, template } = body;

    // Validate required fields
    if (!to || !candidateId || !candidateName || !message) {
      console.log("❌ Mail API: Missing required fields");
      return NextResponse.json(
        { error: "Wymagane pola: to, candidateId, candidateName, message" },
        { status: 400 }
      );
    }

    console.log(`📝 Mail API: Sending to ${to}, template: ${template}`);

    // Prepare email content
    const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Feedback - ${position}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .content { padding: 20px 0; }
          .footer { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 20px; font-size: 12px; color: #666; }
          .highlight { color: #0066cc; font-weight: bold; }
          .message { background: white; padding: 20px; border-left: 4px solid #0066cc; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>Feedback dotyczący Twojej aplikacji</h2>
          <p>Stanowisko: <span class="highlight">${position}</span></p>
        </div>
        
        <div class="content">
          <p>Szanowny/a ${candidateName},</p>
          
          <div class="message">
            ${message.replace(/\n/g, '<br>')}
          </div>
        </div>
        
        <div class="footer">
          <p>Wiadomość wysłana automatycznie z systemu rekrutacyjnego.<br>
          Jeśli masz pytania, odpowiedz na ten mail.</p>
        </div>
      </body>
    </html>`;

  let emailResult: any = null;
  let emailSuccess = false;

    try {
      if (resend && process.env.RESEND_API_KEY) {
        // Clean tag values to only contain ASCII letters, numbers, underscores, or dashes
        const cleanTagValue = (value: string) => value.replace(/[^a-zA-Z0-9_-]/g, '_');

        // Send email using Resend
        emailResult = await resend.emails.send({
          from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
          to: [to],
          subject: subject,
          html: emailHtml,
          replyTo: process.env.FROM_EMAIL || 'onboarding@resend.dev',
          tags: [
            {
              name: 'category',
              value: 'candidate-feedback'
            },
            {
              name: 'template',
              value: cleanTagValue(template || 'default')
            }
          ]
        });

        emailSuccess = emailResult && !emailResult.error;
        console.log("✅ Mail sent successfully via Resend:", emailResult?.data?.id);
      } else {
        // Development mode - simulate email sending
        console.log("📧 Development mode - simulating email send");
        emailResult = { data: { id: `dev-${Date.now()}` } };
        emailSuccess = true;
      }

      // Note: persistence to message history is disabled in this build to avoid schema drift issues.
      // If needed, re-enable once Prisma schema and client are aligned.
      return NextResponse.json({ 
        success: true,
        messageId: emailResult?.data?.id || emailResult?.id,
        message: "Mail został wysłany pomyślnie"
      });

    } catch (emailError: any) {
      console.error("❌ Error sending email:", emailError);
      return NextResponse.json(
        { 
          error: "Nie udało się wysłać maila",
          details: emailError.message 
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error("💥 General API Error:", error);
    return NextResponse.json(
      { 
        error: "Wystąpił nieoczekiwany błąd podczas wysyłania maila",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}