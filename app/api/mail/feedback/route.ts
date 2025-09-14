import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const mailchimp = require('@mailchimp/mailchimp_transactional');

// Initialize Mailchimp transactional client
let mailchimpClient: any = null;
if (process.env.MAILCHIMP_TRANSACTIONAL_API_KEY) {
  mailchimpClient = mailchimp(process.env.MAILCHIMP_TRANSACTIONAL_API_KEY);
}

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
      if (mailchimpClient && process.env.MAILCHIMP_TRANSACTIONAL_API_KEY) {
        // Send email using Mailchimp Transactional (Mandrill)
        const emailMessage = {
          html: emailHtml,
          text: `${candidateName},\n\n${message}\n\nPozdrawiamy,\nZespół Rekrutacji`,
          subject: subject,
          from_email: process.env.FROM_EMAIL || 'noreply@company.com',
          from_name: 'Zespół Rekrutacji',
          to: [
            {
              email: to,
              name: candidateName,
              type: 'to'
            }
          ],
          headers: {
            'Reply-To': process.env.FROM_EMAIL || 'noreply@company.com'
          },
          tags: ['candidate-feedback', template],
          metadata: {
            candidateId: candidateId,
            template: template
          }
        };

        emailResult = await mailchimpClient.messages.send({
          message: emailMessage
        });

        emailSuccess = emailResult[0]?.status === 'sent';
        console.log("✅ Mail sent successfully via Mailchimp:", emailResult[0]?.id);
      } else {
        // Development mode - simulate email sending
        console.log("📧 Development mode - simulating email send");
        emailResult = [{ id: `dev-${Date.now()}`, status: 'sent' }];
        emailSuccess = true;
      }

      // Find the user by email for proper foreign key
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });

      // Save to message history
      const messageHistory = await prisma.messageHistory.create({
        data: {
          candidateApplicationId: candidateId,
          subject: subject,
          content: message,
          template: template,
          recipientEmail: to,
          recipientName: candidateName,
          senderUserId: user?.id || null,
          mailProvider: 'mailchimp',
          externalMessageId: emailResult[0]?.id || null,
          status: emailSuccess ? 'SENT' : 'FAILED',
        }
      });

      // Update candidate status to CONTACTED
      await prisma.candidateApplication.update({
        where: { id: candidateId },
        data: { status: 'CONTACTED' }
      });

      console.log("💾 Message saved to history:", messageHistory.id);
      
      return NextResponse.json({ 
        success: true,
        messageId: emailResult[0]?.id,
        historyId: messageHistory.id,
        message: "Mail został wysłany pomyślnie i zapisany w historii"
      });

    } catch (emailError: any) {
      console.error("❌ Error sending email:", emailError);
      
      // Find the user by email for proper foreign key
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });

      // Save failed attempt to history
      try {
        await prisma.messageHistory.create({
          data: {
            candidateApplicationId: candidateId,
            subject: subject,
            content: message,
            template: template,
            recipientEmail: to,
            recipientName: candidateName,
            senderUserId: user?.id || null,
            mailProvider: 'mailchimp',
            status: 'FAILED',
            errorMessage: emailError.message
          }
        });
      } catch (historyError) {
        console.error("❌ Failed to save error to history:", historyError);
      }

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