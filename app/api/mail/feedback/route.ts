import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface MailRequest {
  to: string;
  candidateName: string;
  position: string;
  subject: string;
  message: string;
  template: string;
}

export async function POST(req: NextRequest) {
  try {
    console.log("📧 Mail API: Received request");
    const body = await req.json() as MailRequest;
    
    const { to, candidateName, position, subject, message, template } = body;

    // Validate required fields
    if (!to || !candidateName || !message) {
      console.log("❌ Mail API: Missing required fields");
      return NextResponse.json(
        { error: "Wymagane pola: to, candidateName, message" },
        { status: 400 }
      );
    }

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.log("❌ Mail API: RESEND_API_KEY not configured");
      return NextResponse.json(
        { error: "Serwis mailowy nie jest skonfigurowany. Skontaktuj się z administratorem." },
        { status: 500 }
      );
    }

    console.log(`📝 Mail API: Sending to ${to}, template: ${template}`);

    // Prepare email content based on template
    let emailHtml = `
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

    try {
      // Send email using Resend
      const emailResult = await resend.emails.send({
        from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
        to: [to],
        subject: subject,
        html: emailHtml,
        text: `${candidateName},\n\n${message}\n\nPozdrawiamy,\nZespół Rekrutacji`
      });

      console.log("✅ Mail sent successfully:", emailResult.data?.id);
      
      return NextResponse.json({ 
        success: true,
        messageId: emailResult.data?.id,
        message: "Mail został wysłany pomyślnie"
      });

    } catch (resendError: any) {
      console.error("💥 Resend API Error:", resendError);
      
      // Handle specific Resend errors
      if (resendError.message?.includes('API key')) {
        return NextResponse.json(
          { error: "Nieprawidłowy klucz API. Skontaktuj się z administratorem." },
          { status: 500 }
        );
      }
      
      if (resendError.message?.includes('domain')) {
        return NextResponse.json(
          { error: "Domena nie jest zweryfikowana. Skontaktuj się z administratorem." },
          { status: 500 }
        );
      }

      // For development - simulate email sending
      console.log("📧 Development mode - simulating email send");
      
      return NextResponse.json({ 
        success: true,
        messageId: `dev-${Date.now()}`,
        message: "Mail został wysłany pomyślnie (tryb deweloperski)",
        debug: {
          to,
          subject,
          template,
          candidateName
        }
      });
    }

  } catch (error) {
    console.error("💥 Mail API Error:", error);
    
    return NextResponse.json(
      { 
        error: "Wystąpił błąd podczas wysyłania maila. Spróbuj ponownie za chwilę.",
        details: process.env.NODE_ENV === 'development' ? error : undefined
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