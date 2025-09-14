import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Resend } from 'resend';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

interface TestMailRequest {
  to: string;
  subject: string;
  message: string;
}

export async function POST(req: NextRequest) {
  try {
    console.log("🧪 Test Mail API: Received request");
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json() as TestMailRequest;
    const { to, subject, message } = body;

    // Validate required fields
    if (!to || !subject || !message) {
      console.log("❌ Test Mail API: Missing required fields");
      return NextResponse.json(
        { error: "Wymagane pola: to, subject, message" },
        { status: 400 }
      );
    }

    console.log(`📝 Test Mail API: Sending test email to ${to}`);

    // Prepare email content
    const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
            background-color: #f9f9f9;
          }
          .container {
            background: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px; 
            border-radius: 8px 8px 0 0; 
            margin: -30px -30px 20px -30px;
            text-align: center;
          }
          .content { 
            padding: 20px 0; 
            white-space: pre-line;
          }
          .footer { 
            background: #f8f9fa; 
            padding: 15px 20px; 
            border-radius: 8px; 
            margin: 20px -30px -30px -30px; 
            font-size: 12px; 
            color: #666; 
            text-align: center;
            border-top: 1px solid #e9ecef;
          }
          .badge {
            display: inline-block;
            background: #28a745;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin: 0; font-size: 24px;">${subject}</h2>
            <div style="margin-top: 8px;">
              <span class="badge">Test Email</span>
            </div>
          </div>
          
          <div class="content">
            ${message}
          </div>
          
          <div class="footer">
            <p style="margin: 0;">
              <strong>Test wiadomości z systemu rekrutacyjnego</strong><br>
              Wysłane przez: ${session.user.email}<br>
              Data: ${new Date().toLocaleString('pl-PL')}
            </p>
          </div>
        </div>
      </body>
    </html>`;

    let emailResult: any = null;

    try {
      if (resend && process.env.RESEND_API_KEY) {
        // Clean tag values to only contain ASCII letters, numbers, underscores, or dashes
        const cleanTagValue = (value: string) => value.replace(/[^a-zA-Z0-9_-]/g, '_');

        // Send email using Resend
        emailResult = await resend.emails.send({
          from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
          to: [to],
          subject: `[TEST] ${subject}`,
          html: emailHtml,
          replyTo: session.user.email || process.env.FROM_EMAIL || 'onboarding@resend.dev',
          tags: [
            {
              name: 'category',
              value: 'test-email'
            },
            {
              name: 'sender',
              value: cleanTagValue(session.user.email || 'unknown')
            }
          ]
        });

        if (emailResult.error) {
          throw new Error(emailResult.error.message || 'Resend API error');
        }

        console.log("✅ Test mail sent successfully via Resend:", emailResult?.data?.id);
        
        return NextResponse.json({ 
          success: true,
          messageId: emailResult?.data?.id,
          message: "Test email został wysłany pomyślnie"
        });
      } else {
        // Development mode - simulate email sending
        console.log("📧 Development mode - simulating test email send");
        return NextResponse.json({ 
          success: true,
          messageId: `dev-test-${Date.now()}`,
          message: "Test email wysłany w trybie deweloperskim (symulacja)"
        });
      }

    } catch (emailError: any) {
      console.error("❌ Error sending test email:", emailError);
      return NextResponse.json(
        { 
          error: "Nie udało się wysłać test email",
          details: emailError.message 
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error("💥 General Test Mail API Error:", error);
    return NextResponse.json(
      { 
        error: "Wystąpił nieoczekiwany błąd podczas wysyłania test email",
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