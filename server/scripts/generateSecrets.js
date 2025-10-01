#!/usr/bin/env node

/**
 * Secret Generator Script for SSM Technologies
 * Generates secure random secrets for production environment
 */

const crypto = require('crypto');

/**
 * Generate a cryptographically secure random string
 * @param {number} length - Length of the secret
 * @param {string} encoding - Encoding format (hex, base64, base64url)
 * @returns {string} Generated secret
 */
function generateSecret(length = 64, encoding = 'hex') {
  return crypto.randomBytes(length).toString(encoding);
}

/**
 * Generate a strong password with mixed characters
 * @param {number} length - Length of the password
 * @returns {string} Generated password
 */
function generateStrongPassword(length = 16) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, charset.length);
    password += charset[randomIndex];
  }
  
  return password;
}

/**
 * Generate UUID v4
 * @returns {string} UUID
 */
function generateUUID() {
  return crypto.randomUUID();
}

console.log('🔐 SSM Technologies - Production Secrets Generator');
console.log('=' .repeat(60));
console.log();

console.log('📋 Copy these secrets to your .env.production file:');
console.log('=' .repeat(60));
console.log();

// JWT Secrets
console.log('# JWT Configuration - CRITICAL: Change these in production');
console.log(`JWT_SECRET=${generateSecret(64, 'base64url')}`);
console.log(`REFRESH_TOKEN_SECRET=${generateSecret(64, 'base64url')}`);
console.log();

// Session Secret
console.log('# Session Secret');
console.log(`SESSION_SECRET=${generateSecret(32, 'hex')}`);
console.log();

// Database Encryption Key
console.log('# Database Encryption Key (if needed)');
console.log(`DB_ENCRYPTION_KEY=${generateSecret(32, 'hex')}`);
console.log();

// API Keys
console.log('# API Keys');
console.log(`API_SECRET_KEY=${generateSecret(32, 'hex')}`);
console.log(`WEBHOOK_SECRET=${generateSecret(24, 'hex')}`);
console.log();

// Admin Password
console.log('# Admin Configuration - CHANGE IMMEDIATELY');
console.log(`ADMIN_PASSWORD=${generateStrongPassword(20)}`);
console.log();

// reCAPTCHA (placeholder)
console.log('# reCAPTCHA Configuration - Get from Google reCAPTCHA Console');
console.log('RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key-here');
console.log();

// Additional Security
console.log('# Additional Security');
console.log(`CSRF_SECRET=${generateSecret(32, 'hex')}`);
console.log(`COOKIE_SECRET=${generateSecret(32, 'hex')}`);
console.log();

// Application ID
console.log('# Application Identifier');
console.log(`APP_ID=${generateUUID()}`);
console.log();

console.log('⚠️  SECURITY WARNINGS:');
console.log('=' .repeat(60));
console.log('1. 🔒 NEVER commit these secrets to version control');
console.log('2. 🔄 Rotate secrets regularly (every 90 days recommended)');
console.log('3. 🔐 Store secrets securely (use environment variables or secret managers)');
console.log('4. 👥 Limit access to production secrets to authorized personnel only');
console.log('5. 📝 Keep a secure backup of these secrets');
console.log('6. 🚫 Never share secrets via email, chat, or unsecured channels');
console.log();

console.log('📚 Additional Setup Required:');
console.log('=' .repeat(60));
console.log('1. Update MongoDB URI with your production database');
console.log('2. Configure reCAPTCHA keys from Google Console');
console.log('3. Set up proper SSL certificates for HTTPS');
console.log('4. Configure email SMTP settings for production');
console.log('5. Set up monitoring and logging for production');
console.log();

console.log('✅ Secrets generated successfully!');
console.log('Copy the above configuration to your server/.env.production file');