const nodemailer = require('nodemailer');
const crypto = require('crypto');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendEmail(to, subject, html) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(userEmail, userName, userType) {
    const subject = 'Welcome to SSM Technologies Institute';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #3b82f6; color: white; padding: 20px; text-align: center;">
          <h1>Welcome to SSM Technologies Institute</h1>
        </div>
        <div style="padding: 20px;">
          <h2>Hello ${userName}!</h2>
          <p>Welcome to SSM Technologies Institute! Your ${userType} account has been successfully created.</p>
          <p>You can now access your dashboard and explore all the features available to you.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/login" 
               style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Login to Your Account
            </a>
          </div>
          <p>If you have any questions, feel free to contact our support team.</p>
          <p>Best regards,<br>SSM Technologies Institute Team</p>
        </div>
        <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    `;

    return await this.sendEmail(userEmail, subject, html);
  }

  async sendPasswordResetEmail(userEmail, userName, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const subject = 'Password Reset Request - SSM Technologies Institute';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #dc2626; color: white; padding: 20px; text-align: center;">
          <h1>Password Reset Request</h1>
        </div>
        <div style="padding: 20px;">
          <h2>Hello ${userName}!</h2>
          <p>We received a request to reset your password for your SSM Technologies Institute account.</p>
          <p>Click the button below to reset your password. This link will expire in 1 hour.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
          <p>For security reasons, this link will expire in 1 hour.</p>
          <p>Best regards,<br>SSM Technologies Institute Team</p>
        </div>
        <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>This is an automated email. Please do not reply to this message.</p>
          <p>If you're having trouble clicking the button, copy and paste this URL into your browser:</p>
          <p style="word-break: break-all;">${resetUrl}</p>
        </div>
      </div>
    `;

    return await this.sendEmail(userEmail, subject, html);
  }

  async sendPasswordResetConfirmation(userEmail, userName) {
    const subject = 'Password Reset Successful - SSM Technologies Institute';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #16a34a; color: white; padding: 20px; text-align: center;">
          <h1>Password Reset Successful</h1>
        </div>
        <div style="padding: 20px;">
          <h2>Hello ${userName}!</h2>
          <p>Your password has been successfully reset for your SSM Technologies Institute account.</p>
          <p>You can now log in with your new password.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/login" 
               style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Login to Your Account
            </a>
          </div>
          <p>If you didn't make this change, please contact our support team immediately.</p>
          <p>Best regards,<br>SSM Technologies Institute Team</p>
        </div>
        <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    `;

    return await this.sendEmail(userEmail, subject, html);
  }

  generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('Email service is ready to send emails');
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }
}

module.exports = new EmailService();