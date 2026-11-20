/**
 * Brevo Transactional Email Service
 * Sends OTP emails for student password reset flows via Brevo REST API v3.
 */

interface SendOtpEmailParams {
  toEmail: string;
  userName?: string;
  otp: string;
}

export async function sendOtpEmail({
  toEmail,
  userName,
  otp,
}: SendOtpEmailParams): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY || "";
  const senderEmail = process.env.BREVO_SENDER_EMAIL || "kumarpawan90107@gmail.com";
  const senderName = process.env.BREVO_SENDER_NAME || "Academic Risk Radar";

  if (process.env.NODE_ENV === "test" || !apiKey) {
    console.log(`[EmailService TEST/MOCK] Sent OTP ${otp} to ${toEmail}`);
    return true;
  }

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #D9DFDD; border-radius: 8px; background: #FFFFFF; color: #1B2A33;">
      <h2 style="margin: 0 0 12px; color: #1B2A33; font-size: 20px;">Password Reset Verification</h2>
      <p style="margin: 0 0 16px; font-size: 14px; color: #5B6B75; line-height: 1.5;">
        Hello ${userName || "User"},
      </p>
      <p style="margin: 0 0 20px; font-size: 14px; color: #1B2A33; line-height: 1.5;">
        You requested to reset your password for Academic Risk Radar. Use the verification code below:
      </p>
      <div style="background: #F2F4F3; border: 1px solid #D9DFDD; border-radius: 6px; padding: 18px; text-align: center; margin: 20px 0;">
        <span style="font-family: monospace; font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #2D5BA3;">${otp}</span>
      </div>
      <p style="margin: 0 0 12px; font-size: 13px; color: #5B6B75; line-height: 1.5;">
        This code is valid for <strong>10 minutes</strong>. If you did not request this code, you can safely ignore this email.
      </p>
      <hr style="border: none; border-top: 1px solid #D9DFDD; margin: 24px 0 16px;" />
      <p style="margin: 0; font-size: 12px; color: #5B6B75;">
        Academic Risk Radar — Institutional Academic Mentorship & Early Warning
      </p>
    </div>
  `;

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: toEmail, name: userName || "User" }],
        subject: "Academic Risk Radar — Password Reset Verification Code",
        htmlContent,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[EmailService] Failed to send email via Brevo:", res.status, errText);
      return false;
    }

    return true;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[EmailService] Network/transport error sending email:", msg);
    return false;
  }
}

