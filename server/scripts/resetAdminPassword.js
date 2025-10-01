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
 * Reset admin password with a new random password
 */
const resetAdminPassword = async () => {
  try {
    console.log('🔐 Starting admin password reset...');
    
    // Connect to database
    await database.connect();
    console.log('✅ Connected to database');

    // Find admin user
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('❌ No admin user found. Please run seedAdmin.js first to create an admin user.');
      return;
    }

    console.log('👤 Found admin user:', adminUser.email);

    // Generate new secure password
    const newPassword = generateSecurePassword(20);
    
    // Update admin password
    adminUser.password = newPassword;
    await adminUser.save();
    
    console.log('✅ Admin password reset successfully!');
    console.log('📧 Admin Email:', adminUser.email);
    console.log('🔑 New Password:', newPassword);
    console.log('⚠️  IMPORTANT: Save this password securely! It will not be shown again.');
    
    console.log('\n📝 Login Credentials:');
    console.log(`Email: ${adminUser.email}`);
    console.log(`Password: ${newPassword}`);
    
    console.log('\n💡 You can now login to the admin panel with these credentials.');

  } catch (error) {
    console.error('❌ Error resetting admin password:', error.message);
    console.error('Full error:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the reset function
if (require.main === module) {
  resetAdminPassword();
}

module.exports = { resetAdminPassword, generateSecurePassword };