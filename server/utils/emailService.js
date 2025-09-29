const nodemailer = require('nodemailer');

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

    // Verify connection on initialization
    this.verifyConnection();
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Email service is ready to send emails');
    } catch (error) {
      console.error('❌ Email service connection failed:', error.message);
    }
  }

  async sendEmail(to, subject, html) {
    try {
      const mailOptions = {
        from: `${process.env.EMAIL_FROM_NAME || 'SSM Technologies'} <${process.env.EMAIL_FROM}>`,
        to,
        subject,
        html,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully to ${to}: ${result.messageId}`);
      return result;
    } catch (error) {
      console.error(`❌ Error sending email to ${to}:`, error.message);
      throw error;
    }
  }

  async sendWelcomeEmail(userEmail, userName, userType) {
    const subject = 'Welcome to SSM Technologies Institute';
    
    const roleSpecificContent = userType === 'instructor' 
      ? `
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #92400e;">
            <strong>⚠️ Instructor Account Approval Required</strong><br>
            Your instructor profile is currently under review. Our team will verify your credentials and approve your account within 24-48 hours. You'll receive an email once your account is approved.
          </p>
        </div>
        <p>In the meantime, you can:</p>
        <ul>
          <li>Complete your instructor profile with your experience and qualifications</li>
          <li>Upload your certificates and credentials</li>
          <li>Explore the platform features</li>
        </ul>
      `
      : `
        <p>As a student, you can now:</p>
        <ul>
          <li>Browse and enroll in available courses</li>
          <li>Access course materials and resources</li>
          <li>Track your learning progress</li>
          <li>Connect with instructors and peers</li>
        </ul>
      `;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to SSM Technologies</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%); color: white; padding: 40px 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Welcome to SSM Technologies Institute</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Empowering Your Learning Journey</p>
          </div>
          
          <!-- Body -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #3b82f6; margin-top: 0;">Hello ${userName}! 👋</h2>
            
            <p style="font-size: 16px; line-height: 1.8;">
              Thank you for joining SSM Technologies Institute! We're thrilled to have you as part of our learning community.
            </p>
            
            <p style="font-size: 16px; line-height: 1.8;">
              Your <strong>${userType}</strong> account has been successfully created, and you're all set to get started.
            </p>
            
            ${roleSpecificContent}
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="${process.env.FRONTEND_URL}/login" 
                 style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);">
                Access Your Dashboard
              </a>
            </div>
            
            <!-- Contact Info -->
            <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-top: 30px;">
              <h3 style="margin-top: 0; color: #1e293b; font-size: 18px;">Need Help?</h3>
              <p style="margin: 10px 0; font-size: 14px; line-height: 1.6;">
                If you have any questions or need assistance, our support team is here to help:
              </p>
              <p style="margin: 5px 0; font-size: 14px;">
                📧 Email: <a href="mailto:info@ssmtechnologies.co.in" style="color: #3b82f6; text-decoration: none;">info@ssmtechnologies.co.in</a><br>
                📞 Phone: +91 98765 43210<br>
                🌐 Website: <a href="${process.env.FRONTEND_URL}" style="color: #3b82f6; text-decoration: none;">${process.env.FRONTEND_URL}</a>
              </p>
            </div>
            
            <p style="margin-top: 30px; font-size: 16px; line-height: 1.8;">
              Best regards,<br>
              <strong>The SSM Technologies Team</strong>
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #1e293b; color: #94a3b8; padding: 25px 30px; text-align: center; font-size: 13px;">
            <p style="margin: 0 0 10px 0;">
              This is an automated email. Please do not reply to this message.
            </p>
            <p style="margin: 0;">
              © ${new Date().getFullYear()} SSM Technologies Institute. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(userEmail, subject, html);
  }

  async sendPasswordResetEmail(userEmail, userName, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const subject = 'Password Reset Request - SSM Technologies Institute';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Request</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; padding: 40px 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Password Reset Request</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Reset Your Account Password</p>
          </div>
          
          <!-- Body -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #dc2626; margin-top: 0;">Hello ${userName}! 👋</h2>
            
            <p style="font-size: 16px; line-height: 1.8;">
              We received a request to reset the password for your SSM Technologies Institute account.
            </p>
            
            <p style="font-size: 16px; line-height: 1.8;">
              Click the button below to create a new password. This link will expire in <strong>1 hour</strong> for security reasons.
            </p>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="${resetUrl}" 
                 style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(220, 38, 38, 0.3);">
                Reset Password
              </a>
            </div>
            
            <!-- Security Notice -->
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 30px 0; border-radius: 4px;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>⚠️ Security Notice:</strong><br>
                If you didn't request this password reset, please ignore this email. Your password will remain unchanged, and no one will be able to access your account.
              </p>
            </div>
            
            <p style="font-size: 14px; line-height: 1.8; color: #64748b;">
              <strong>Trouble clicking the button?</strong> Copy and paste this link into your browser:<br>
              <a href="${resetUrl}" style="color: #3b82f6; word-break: break-all;">${resetUrl}</a>
            </p>
            
            <p style="margin-top: 30px; font-size: 16px; line-height: 1.8;">
              Best regards,<br>
              <strong>The SSM Technologies Team</strong>
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #1e293b; color: #94a3b8; padding: 25px 30px; text-align: center; font-size: 13px;">
            <p style="margin: 0 0 10px 0;">
              This is an automated email. Please do not reply to this message.
            </p>
            <p style="margin: 0;">
              For security reasons, this password reset link will expire in 1 hour.
            </p>
            <p style="margin: 10px 0 0 0;">
              © ${new Date().getFullYear()} SSM Technologies Institute. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(userEmail, subject, html);
  }

  async sendPasswordResetConfirmation(userEmail, userName) {
    const subject = 'Password Reset Successful - SSM Technologies Institute';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Successful</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); color: white; padding: 40px 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">✅ Password Reset Successful</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your Password Has Been Updated</p>
          </div>
          
          <!-- Body -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #16a34a; margin-top: 0;">Hello ${userName}! 👋</h2>
            
            <p style="font-size: 16px; line-height: 1.8;">
              Your password has been successfully reset for your SSM Technologies Institute account.
            </p>
            
            <p style="font-size: 16px; line-height: 1.8;">
              You can now log in with your new password and continue your learning journey.
            </p>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="${process.env.FRONTEND_URL}/login" 
                 style="display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(22, 163, 74, 0.3);">
                Login to Your Account
              </a>
            </div>
            
            <!-- Security Notice -->
            <div style="background-color: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 30px 0; border-radius: 4px;">
              <p style="margin: 0; color: #991b1b; font-size: 14px;">
                <strong>⚠️ Didn't Make This Change?</strong><br>
                If you didn't reset your password, please contact our support team immediately. Your account security is important to us.
              </p>
            </div>
            
            <!-- Contact Info -->
            <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-top: 30px;">
              <h3 style="margin-top: 0; color: #1e293b; font-size: 18px;">Contact Support</h3>
              <p style="margin: 10px 0; font-size: 14px;">
                📧 Email: <a href="mailto:info@ssmtechnologies.co.in" style="color: #3b82f6; text-decoration: none;">info@ssmtechnologies.co.in</a><br>
                📞 Phone: +91 98765 43210
              </p>
            </div>
            
            <p style="margin-top: 30px; font-size: 16px; line-height: 1.8;">
              Best regards,<br>
              <strong>The SSM Technologies Team</strong>
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #1e293b; color: #94a3b8; padding: 25px 30px; text-align: center; font-size: 13px;">
            <p style="margin: 0 0 10px 0;">
              This is an automated email. Please do not reply to this message.
            </p>
            <p style="margin: 0;">
              © ${new Date().getFullYear()} SSM Technologies Institute. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(userEmail, subject, html);
  }

  async sendReplyEmail(userEmail, userName, replyMessage, originalSubject) {
    const subject = `Re: ${originalSubject} - SSM Technologies Institute`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reply to Your Message</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%); color: white; padding: 40px 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Reply to Your Message</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">SSM Technologies Institute</p>
          </div>
          
          <!-- Body -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #3b82f6; margin-top: 0;">Hello ${userName}! 👋</h2>
            
            <p style="font-size: 16px; line-height: 1.8;">
              Thank you for contacting SSM Technologies Institute. We have received your message and here is our response:
            </p>
            
            <!-- Reply Message -->
            <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 20px; margin: 30px 0; border-radius: 4px;">
              <p style="margin: 0; white-space: pre-wrap; font-size: 15px; line-height: 1.8;">${replyMessage}</p>
            </div>
            
            <p style="font-size: 16px; line-height: 1.8;">
              If you have any additional questions or need further assistance, please don't hesitate to contact us again.
            </p>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="${process.env.FRONTEND_URL}/contact" 
                 style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);">
                Contact Us Again
              </a>
            </div>
            
            <!-- Contact Info -->
            <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-top: 30px;">
              <h3 style="margin-top: 0; color: #1e293b; font-size: 18px;">Get in Touch</h3>
              <p style="margin: 10px 0; font-size: 14px;">
                📧 Email: <a href="mailto:info@ssmtechnologies.co.in" style="color: #3b82f6; text-decoration: none;">info@ssmtechnologies.co.in</a><br>
                📞 Phone: +91 98765 43210<br>
                🌐 Website: <a href="${process.env.FRONTEND_URL}" style="color: #3b82f6; text-decoration: none;">${process.env.FRONTEND_URL}</a>
              </p>
            </div>
            
            <p style="margin-top: 30px; font-size: 16px; line-height: 1.8;">
              Best regards,<br>
              <strong>The SSM Technologies Team</strong>
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #1e293b; color: #94a3b8; padding: 25px 30px; text-align: center; font-size: 13px;">
            <p style="margin: 0 0 10px 0;">
              This email was sent in response to your inquiry.
            </p>
            <p style="margin: 0;">
              © ${new Date().getFullYear()} SSM Technologies Institute. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(userEmail, subject, html);
  }

  async sendInstructorApprovalEmail(userEmail, userName, approved) {
    const subject = approved 
      ? 'Instructor Account Approved - SSM Technologies Institute'
      : 'Instructor Application Update - SSM Technologies Institute';
    
    const statusColor = approved ? '#16a34a' : '#dc2626';
    const statusGradient = approved 
      ? 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)'
      : 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Instructor Account ${approved ? 'Approved' : 'Update'}</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1);">
          <div style="background: ${statusGradient}; color: white; padding: 40px 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">
              ${approved ? '✅ Account Approved!' : '⚠️ Application Update'}
            </h1>
          </div>
          
          <div style="padding: 40px 30px;">
            <h2 style="color: ${statusColor}; margin-top: 0;">Hello ${userName}! 👋</h2>
            
            <p style="font-size: 16px; line-height: 1.8;">
              ${approved 
                ? 'Congratulations! Your instructor account has been approved. You can now start creating courses and teaching students on our platform.'
                : 'Thank you for your interest in becoming an instructor. Unfortunately, we need more information before we can approve your account. Please update your profile and resubmit your application.'
              }
            </p>
            
            ${approved ? `
              <div style="text-align: center; margin: 40px 0;">
                <a href="${process.env.FRONTEND_URL}/dashboard" 
                   style="display: inline-block; background: ${statusGradient}; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  Go to Dashboard
                </a>
              </div>
            ` : ''}
            
            <p style="margin-top: 30px; font-size: 16px; line-height: 1.8;">
              Best regards,<br>
              <strong>The SSM Technologies Team</strong>
            </p>
          </div>
          
          <div style="background-color: #1e293b; color: #94a3b8; padding: 25px 30px; text-align: center; font-size: 13px;">
            <p style="margin: 0;">
              © ${new Date().getFullYear()} SSM Technologies Institute. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(userEmail, subject, html);
  }
}

module.exports = new EmailService();