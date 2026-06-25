const nodemailer = require('nodemailer');

/**
 * Sends an email using Nodemailer.
 * Falls back to logging to the console if EMAIL_USER and EMAIL_PASS are not configured in .env.
 */
const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) {
      console.log('\n==================================================');
      console.log(`✉️  [MOCK EMAIL SENT]`);
      console.log(`TO:      ${to}`);
      console.log(`SUBJECT: ${subject}`);
      console.log(`TEXT:    ${text}`);
      console.log('==================================================\n');
      return { mock: true, text };
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: user,
        pass: pass,
      },
    });

    const mailOptions = {
      from: `"Learn2Code Support" <${user}>`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️  [REAL EMAIL SENT] MessageId: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
};

/**
 * Sends a password reset OTP.
 */
const sendOtpEmail = async (to, otp) => {
  const subject = 'Reset Your Learn2Code Password';
  const text = `Your password reset verification code is: ${otp}. It will expire in 15 minutes.`;
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F8FAFC; padding: 40px 20px; color: #1E293B; line-height: 1.6;">
      <div style="max-width: 500px; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        <!-- Header -->
        <div style="background-color: #4F46E5; padding: 24px; text-align: center;">
          <h1 style="color: #FFFFFF; margin: 0; font-size: 24px; font-weight: 700;">Learn2Code</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 32px 24px;">
          <h2 style="margin-top: 0; color: #0F172A; font-size: 20px; font-weight: 600;">Password Reset Verification</h2>
          <p style="color: #64748B; font-size: 16px;">We received a request to reset your password. Use the verification code below to proceed. This code is valid for 15 minutes.</p>
          
          <!-- OTP Box -->
          <div style="background-color: #F1F5F9; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; border: 1px dashed #CBD5E1;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #4F46E5; font-family: monospace;">${otp}</span>
          </div>
          
          <p style="color: #64748B; font-size: 14px; margin-bottom: 0;">If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #F8FAFC; padding: 16px; text-align: center; border-top: 1px solid #E2E8F0; font-size: 12px; color: #94A3B8;">
          © ${new Date().getFullYear()} Learn2Code. All rights reserved.
        </div>
      </div>
    </div>
  `;

  return sendEmail({ to, subject, text, html });
};

module.exports = {
  sendEmail,
  sendOtpEmail,
};
