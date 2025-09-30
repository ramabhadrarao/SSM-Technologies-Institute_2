// Migration script to transfer settings from JSON file to MongoDB
const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// Import the Settings model
const Settings = require('../models/Settings');

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ssm_technologies');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Load settings from JSON file
const loadSettingsFromFile = async () => {
  try {
    const settingsPath = path.join(__dirname, '../config/settings.json');
    const data = await fs.readFile(settingsPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.log('⚠️  No existing settings.json file found, will use defaults');
    return null;
  }
};

// Migrate settings to database
const migrateSettings = async () => {
  try {
    console.log('🔄 Starting settings migration...');
    
    // Check if settings already exist in database
    const existingSettings = await Settings.find({});
    if (existingSettings.length > 0) {
      console.log('⚠️  Settings already exist in database. Skipping migration.');
      console.log(`Found ${existingSettings.length} setting categories in database:`);
      existingSettings.forEach(setting => {
        console.log(`   - ${setting.category}`);
      });
      return;
    }
    
    // Load settings from JSON file
    const fileSettings = await loadSettingsFromFile();
    
    if (!fileSettings) {
      console.log('📝 No existing settings found. Initializing with defaults...');
      await Settings.resetToDefault();
      console.log('✅ Default settings initialized in database');
      return;
    }
    
    console.log('📁 Found existing settings.json file. Migrating to database...');
    
    // Migrate each category
    const categories = Object.keys(fileSettings);
    let migratedCount = 0;
    
    for (const category of categories) {
      try {
        await Settings.updateByCategory(category, fileSettings[category]);
        console.log(`   ✅ Migrated ${category} settings`);
        migratedCount++;
      } catch (error) {
        console.error(`   ❌ Failed to migrate ${category} settings:`, error.message);
      }
    }
    
    console.log(`🎉 Migration completed! ${migratedCount}/${categories.length} categories migrated successfully.`);
    
    // Create backup of original file
    const backupPath = path.join(__dirname, '../config/settings.json.backup');
    try {
      await fs.copyFile(
        path.join(__dirname, '../config/settings.json'),
        backupPath
      );
      console.log(`💾 Original settings.json backed up to: ${backupPath}`);
    } catch (error) {
      console.log('⚠️  Could not create backup of original settings file');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

// Verify migration
const verifyMigration = async () => {
  try {
    console.log('\n🔍 Verifying migration...');
    
    const allSettings = await Settings.getAllSettings();
    const categories = Object.keys(allSettings);
    
    console.log(`✅ Found ${categories.length} setting categories in database:`);
    categories.forEach(category => {
      const settingsCount = Object.keys(allSettings[category]).length;
      console.log(`   - ${category}: ${settingsCount} settings`);
    });
    
    console.log('\n📊 Sample settings verification:');
    if (allSettings.general) {
      console.log(`   Site Name: ${allSettings.general.siteName}`);
      console.log(`   Contact Email: ${allSettings.general.contactEmail}`);
    }
    
    console.log('\n✅ Migration verification completed successfully!');
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
    throw error;
  }
};

// Main migration function
const runMigration = async () => {
  try {
    console.log('🚀 SSM Technologies - Settings Migration Tool');
    console.log('==========================================\n');
    
    await connectDB();
    await migrateSettings();
    await verifyMigration();
    
    console.log('\n🎉 Settings migration completed successfully!');
    console.log('You can now use the database-based settings system.');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run migration if this script is executed directly
if (require.main === module) {
  runMigration();
}

module.exports = {
  runMigration,
  migrateSettings,
  verifyMigration
};