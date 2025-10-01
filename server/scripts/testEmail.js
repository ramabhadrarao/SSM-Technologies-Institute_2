#!/usr/bin/env node

require('dotenv').config();
const emailService = require('../utils/emailService');

async function sendTestEmail() {
  try {
    // Get email address from command line arguments
    const testEmail = process.argv[2];
    
    if (!testEmail) {
      console.log('❌ Error: Please provide an email address');
      console.log('Usage: node testEmail.js <email@example.com>');
      process.exit(1);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      console.log('❌ Error: Invalid email format');
      process.exit(1);
    }

    console.log('📧 Testing email configuration...');
    console.log(`📤 Sending test email to: ${testEmail}`);
    console.log('⏳ Please wait...\n');

    // Email content
    const subject = 'Command Line Test Email - SSM Technologies Institute';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Command Line Test Email</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">✅ Command Line Email Test</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">SSM Technologies Institute</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
          <h2 style="color: #3b82f6; margin-top: 0;">🎉 Email Configuration Working!</h2>
          
          <p>This test email was sent successfully from the command line using your configured SMTP settings.</p>
          
          <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong>📋 Test Details:</strong><br>
            📧 Sent to: ${testEmail}<br>
            🕒 Time: ${new Date().toLocaleString()}<br>
            💻 Method: Command Line Script<br>
            🌐 SMTP Host: ${process.env.EMAIL_HOST}<br>
            📬 From: ${process.env.EMAIL_FROM}
          </div>
          
          <p>Your email system is ready for:</p>
          <ul>
            <li>✅ User registration confirmations</li>
            <li>✅ Password reset emails</li>
            <li>✅ Contact form notifications</li>
            <li>✅ System alerts and updates</li>
          </ul>
          
          <p style="margin-top: 30px;">
            Best regards,<br>
            <strong>SSM Technologies Team</strong>
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px; font-size: 12px; color: #666;">
          © ${new Date().getFullYear()} SSM Technologies Institute. All rights reserved.
        </div>
      </body>
      </html>
    `;

    // Send the email
    const result = await emailService.sendEmail(testEmail, subject, html);
    
    console.log('✅ SUCCESS! Test email sent successfully');
    console.log(`📧 Message ID: ${result.messageId}`);
    console.log(`📤 Sent to: ${testEmail}`);
    console.log(`🕒 Time: ${new Date().toLocaleString()}`);
    console.log('\n📬 Please check the recipient\'s inbox (including spam folder)');
    
  } catch (error) {
    console.log('❌ ERROR: Failed to send test email');
    console.log(`💥 Error details: ${error.message}`);
    
    // Provide helpful troubleshooting tips
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Check your .env file for correct email settings');
    console.log('2. Verify SMTP credentials are valid');
    console.log('3. Ensure Gmail app password is correct (if using Gmail)');
    console.log('4. Check if less secure app access is enabled');
    console.log('5. Verify network connectivity');
    
    process.exit(1);
  }
}

// Display configuration info
console.log('🔧 Email Configuration:');
console.log(`📧 SMTP Host: ${process.env.EMAIL_HOST}`);
console.log(`🔌 SMTP Port: ${process.env.EMAIL_PORT}`);
console.log(`👤 SMTP User: ${process.env.EMAIL_USER}`);
console.log(`📤 From Email: ${process.env.EMAIL_FROM}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Run the test
sendTestEmail();