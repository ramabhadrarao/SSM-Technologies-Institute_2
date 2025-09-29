require('dotenv').config();
const mongoose = require('mongoose');
const crypto = require('crypto');
const database = require('../config/database');
const User = require('../models/User');

/**
 * Generate a secure random password
 * @param {number} length - Password length (default: 16)
 * @returns {string} - Secure random password
 */
const generateSecurePassword = (length = 16) => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  
  // Ensure at least one character from each category
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';
  
  password += uppercase[crypto.randomInt(0, uppercase.length)];
  password += lowercase[crypto.randomInt(0, lowercase.length)];
  password += numbers[crypto.randomInt(0, numbers.length)];
  password += symbols[crypto.randomInt(0, symbols.length)];
  
  // Fill the rest with random characters
  for (let i = 4; i < length; i++) {
    password += charset[crypto.randomInt(0, charset.length)];
  }
  
  // Shuffle the password to randomize character positions
  return password.split('').sort(() => crypto.randomInt(-1, 2)).join('');
};

/**
 * Create admin user with secure credentials
 */
const seedAdmin = async () => {
  try {
    console.log('🔐 Starting admin user creation...');
    
    // Connect to database
    await database.connect();
    console.log('✅ Connected to database');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists:', existingAdmin.email);
      console.log('🔄 Skipping admin creation to prevent duplicates');
      return;
    }

    // Generate secure password if not provided in environment
    const adminPassword = process.env.ADMIN_PASSWORD || generateSecurePassword(20);
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@ssmtechnologies.co.in';

    // Create admin user
    console.log('👤 Creating admin user...');
    const adminUser = new User({
      email: adminEmail,
      password: adminPassword,
      firstName: process.env.ADMIN_FIRST_NAME || 'System',
      lastName: process.env.ADMIN_LAST_NAME || 'Administrator',
      phone: process.env.ADMIN_PHONE || '+91 98765 43210',
      whatsapp: process.env.ADMIN_WHATSAPP || '+91 98765 43210',
      role: 'admin',
      isEmailVerified: true, // Admin should be pre-verified
      isActive: true
    });

    await adminUser.save();
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminEmail);
    
    // Only show password if it was auto-generated (not from env)
    if (!process.env.ADMIN_PASSWORD) {
      console.log('🔑 Generated Password:', adminPassword);
      console.log('⚠️  IMPORTANT: Save this password securely! It will not be shown again.');
      console.log('💡 Tip: Add ADMIN_PASSWORD to your .env file to use a custom password');
    } else {
      console.log('🔑 Password: Using password from environment variable');
    }
    
    console.log('\n📝 Environment Variables (add to .env file):');
    console.log(`ADMIN_EMAIL=${adminEmail}`);
    if (!process.env.ADMIN_PASSWORD) {
      console.log(`ADMIN_PASSWORD=${adminPassword}`);
    }
    console.log(`ADMIN_FIRST_NAME=${adminUser.firstName}`);
    console.log(`ADMIN_LAST_NAME=${adminUser.lastName}`);
    console.log(`ADMIN_PHONE=${adminUser.phone}`);
    console.log(`ADMIN_WHATSAPP=${adminUser.whatsapp}`);

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    
    if (error.code === 11000) {
      console.log('⚠️  Admin with this email already exists');
    } else {
      console.error('Full error:', error);
    }
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the seed function
if (require.main === module) {
  seedAdmin();
}

module.exports = { seedAdmin, generateSecurePassword };