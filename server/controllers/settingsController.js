// server/controllers/settingsController.js
const User = require('../models/User');
const Course = require('../models/Course');
const Settings = require('../models/Settings');
const fs = require('fs').promises;
const path = require('path');

// Default settings are now managed by the Settings model
// No need for hardcoded systemSettings object

// Get all system settings
const getSystemSettings = async (req, res) => {
  try {
    // Initialize defaults if no settings exist
    await Settings.initializeDefaults();
    
    // Get all settings from database
    const settings = await Settings.getAllSettings();
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Get system settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get system settings',
      data: {} // Return empty object on error
    });
  }
};

// Get specific setting category
const getSettingCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    // Initialize defaults if no settings exist
    await Settings.initializeDefaults();
    
    const settings = await Settings.getByCategory(category);
    
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Setting category not found'
      });
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Get setting category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get setting category'
    });
  }
};

// Update system settings
const updateSystemSettings = async (req, res) => {
  try {
    const { category, settings: newSettings } = req.body;
    
    if (!category || !newSettings) {
      return res.status(400).json({
        success: false,
        message: 'Category and settings are required'
      });
    }

    // Get user ID from request (if available)
    const userId = req.user ? req.user.id : null;
    
    // Update the specific category using the model
    const updatedSettings = await Settings.updateByCategory(category, newSettings, userId);
    
    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: updatedSettings
    });
  } catch (error) {
    console.error('Update system settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings'
    });
  }
};

// Reset settings to default
const resetSettings = async (req, res) => {
  try {
    const { category } = req.body;
    
    // Use the model's reset method
    const resetData = await Settings.resetToDefault(category);
    
    if (category) {
      res.json({
        success: true,
        message: `${category} settings reset to default`,
        data: resetData
      });
    } else {
      res.json({
        success: true,
        message: 'All settings reset to default',
        data: resetData
      });
    }
  } catch (error) {
    console.error('Reset settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset settings'
    });
  }
};

// Get system information
const getSystemInfo = async (req, res) => {
  try {
    const [
      totalUsers,
      totalCourses,
      totalRevenue,
      systemStats
    ] = await Promise.all([
      User.countDocuments({}),
      Course.countDocuments({}),
      calculateTotalRevenue(),
      getSystemStats()
    ]);

    const systemInfo = {
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      platform: process.platform,
      lastBackup: await getLastBackupTime(),
      database: {
        status: 'connected',
        collections: {
          users: totalUsers,
          courses: totalCourses
        }
      },
      statistics: {
        totalUsers,
        totalCourses,
        totalRevenue,
        ...systemStats
      }
    };

    res.json({
      success: true,
      data: systemInfo
    });
  } catch (error) {
    console.error('Get system info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get system information'
    });
  }
};

// Backup system data
const backupSystem = async (req, res) => {
  try {
    const backupData = {
      timestamp: new Date().toISOString(),
      users: await User.find({}).select('-password'),
      courses: await Course.find({}),
      settings: await Settings.getAllSettings(),
      systemInfo: {
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version
      }
    };

    const backupPath = path.join(__dirname, '../backups');
    await fs.mkdir(backupPath, { recursive: true });
    
    const backupFile = path.join(backupPath, `backup-${Date.now()}.json`);
    await fs.writeFile(backupFile, JSON.stringify(backupData, null, 2));

    res.json({
      success: true,
      message: 'System backup created successfully',
      data: {
        backupFile: path.basename(backupFile),
        timestamp: backupData.timestamp
      }
    });
  } catch (error) {
    console.error('Backup system error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create system backup'
    });
  }
};

// Test email configuration
const testEmailConfig = async (req, res) => {
  try {
    const { testEmail } = req.body;
    
    if (!testEmail) {
      return res.status(400).json({
        success: false,
        message: 'Test email address is required'
      });
    }

    // Import EmailService
    const emailService = require('../utils/emailService');

    // Send test email
    const subject = 'Test Email - SSM Technologies Institute';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Test Email</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%); color: white; padding: 40px 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">✅ Test Email Successful!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">SSM Technologies Institute</p>
          </div>
          
          <!-- Body -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #3b82f6; margin-top: 0;">Email Configuration Working! 🎉</h2>
            
            <p style="font-size: 16px; line-height: 1.8;">
              Congratulations! Your email configuration is working correctly. This test email confirms that:
            </p>
            
            <ul style="font-size: 16px; line-height: 1.8; padding-left: 20px;">
              <li>✅ SMTP settings are configured properly</li>
              <li>✅ Email authentication is working</li>
              <li>✅ Email delivery is functional</li>
              <li>✅ HTML email formatting is supported</li>
            </ul>
            
            <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 30px 0; border-radius: 4px;">
              <p style="margin: 0; font-size: 15px; line-height: 1.8;">
                <strong>Test Details:</strong><br>
                📧 Sent to: ${testEmail}<br>
                🕒 Time: ${new Date().toLocaleString()}<br>
                🌐 From: SSM Technologies Institute Email System
              </p>
            </div>
            
            <p style="font-size: 16px; line-height: 1.8;">
              Your email system is now ready to send welcome emails, password resets, notifications, and other important communications to your users.
            </p>
            
            <p style="margin-top: 30px; font-size: 16px; line-height: 1.8;">
              Best regards,<br>
              <strong>The SSM Technologies Team</strong>
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #1e293b; color: #94a3b8; padding: 25px 30px; text-align: center; font-size: 13px;">
            <p style="margin: 0 0 10px 0;">
              This is a test email sent from your SSM Technologies Institute system.
            </p>
            <p style="margin: 0;">
              © ${new Date().getFullYear()} SSM Technologies Institute. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    await emailService.sendEmail(testEmail, subject, html);
    
    res.json({
      success: true,
      message: `Test email sent successfully to ${testEmail}`
    });
  } catch (error) {
    console.error('Test email config error:', error);
    res.status(500).json({
      success: false,
      message: `Failed to send test email: ${error.message}`
    });
  }
};

// Get maintenance mode status
const getMaintenanceMode = async (req, res) => {
  try {
    // Get maintenance settings from database
    const settings = await Settings.getByCategory('general');
    
    res.json({
      success: true,
      data: {
        enabled: settings?.maintenanceMode || false,
        message: settings?.maintenanceMessage || 'System is under maintenance. Please try again later.',
        estimatedDowntime: settings?.estimatedDowntime || null
      }
    });
  } catch (error) {
    console.error('Get maintenance mode error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get maintenance mode status'
    });
  }
};

// Toggle maintenance mode
const toggleMaintenanceMode = async (req, res) => {
  try {
    const { enabled, message, estimatedDowntime } = req.body;
    
    // Get current general settings
    const currentSettings = await Settings.getByCategory('general') || {};
    
    // Update maintenance mode settings
    const updatedSettings = {
      ...currentSettings,
      maintenanceMode: enabled,
      maintenanceMessage: message || 'System is under maintenance. Please try again later.',
      estimatedDowntime: estimatedDowntime || null
    };
    
    // Save updated settings
    await Settings.updateByCategory('general', updatedSettings, req.user?.id);
    
    res.json({
      success: true,
      message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'}`,
      data: {
        enabled,
        message: updatedSettings.maintenanceMessage,
        estimatedDowntime: updatedSettings.estimatedDowntime
      }
    });
  } catch (error) {
    console.error('Toggle maintenance mode error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle maintenance mode'
    });
  }
};

// Helper functions
// Remove the old file-based functions as they're no longer needed
// const loadSettingsFromFile = async () => { ... }
// const saveSettingsToFile = async (settings) => { ... }

const calculateTotalRevenue = async () => {
  try {
    const Student = require('../models/Student');
    const result = await Student.aggregate([
      { $unwind: '$enrolledCourses' },
      {
        $lookup: {
          from: 'courses',
          localField: 'enrolledCourses.course',
          foreignField: '_id',
          as: 'course'
        }
      },
      { $unwind: '$course' },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$course.fees' }
        }
      }
    ]);
    return result[0]?.totalRevenue || 0;
  } catch (error) {
    return 0;
  }
};

const getSystemStats = async () => {
  try {
    const Batch = require('../models/Batch');
    const ContactMessage = require('../models/ContactMessage');
    
    const [
      activeBatches,
      pendingMessages
    ] = await Promise.all([
      Batch.countDocuments({ isActive: true }),
      ContactMessage.countDocuments({ status: 'new' })
    ]);

    return {
      activeBatches,
      pendingMessages
    };
  } catch (error) {
    return {
      activeBatches: 0,
      pendingMessages: 0
    };
  }
};

const getLastBackupTime = async () => {
  try {
    const backupPath = path.join(__dirname, '../backups');
    const files = await fs.readdir(backupPath);
    const backupFiles = files.filter(file => file.startsWith('backup-'));
    
    if (backupFiles.length === 0) {
      return null;
    }

// Get the most recent backup file
    const latestBackup = backupFiles
      .map(file => {
        const timestamp = file.replace('backup-', '').replace('.json', '');
        return {
          file,
          timestamp: parseInt(timestamp)
        };
      })
      .sort((a, b) => b.timestamp - a.timestamp)[0];

    return new Date(latestBackup.timestamp).toISOString();
  } catch (error) {
    return null;
  }
};

// Get public settings (only general category for non-authenticated users)
const getPublicSettings = async (req, res) => {
  try {
    // Initialize defaults if no settings exist
    await Settings.initializeDefaults();
    
    // Get only general settings for public access
    const generalSettings = await Settings.getByCategory('general');
    
    res.json({
      success: true,
      data: {
        general: generalSettings || {}
      }
    });
  } catch (error) {
    console.error('Get public settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get public settings',
      data: {
        general: {
          siteName: 'SSM Technologies',
          siteDescription: 'Leading Coaching Institute for Technology Education',
          contactEmail: 'info@ssmtechnologies.co.in',
          contactPhone: '+91 98765 43210',
          address: '123 Education Street, Knowledge City, Chennai, Tamil Nadu 600001',
          timezone: 'Asia/Kolkata',
          language: 'en',
          currency: 'INR'
        }
      }
    });
  }
};

// Get specific public setting category (only general allowed)
const getPublicSettingCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    // Only allow general category for public access
    if (category !== 'general') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only general settings are publicly available.'
      });
    }
    
    // Initialize defaults if no settings exist
    await Settings.initializeDefaults();
    
    const settings = await Settings.getByCategory(category);
    
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Setting category not found'
      });
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Get public setting category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get public setting category',
      data: {
        siteName: 'SSM Technologies',
        siteDescription: 'Leading Coaching Institute for Technology Education',
        contactEmail: 'info@ssmtechnologies.co.in',
        contactPhone: '+91 98765 43210',
        address: '123 Education Street, Knowledge City, Chennai, Tamil Nadu 600001',
        timezone: 'Asia/Kolkata',
        language: 'en',
        currency: 'INR'
      }
    });
  }
};

module.exports = {
  getSystemSettings,
  getSettingCategory,
  updateSystemSettings,
  resetSettings,
  getSystemInfo,
  backupSystem,
  testEmailConfig,
  getMaintenanceMode,
  toggleMaintenanceMode,
  getPublicSettings,
  getPublicSettingCategory
};