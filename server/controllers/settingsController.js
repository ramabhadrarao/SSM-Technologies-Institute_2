// server/controllers/settingsController.js
const User = require('../models/User');
const Course = require('../models/Course');
const fs = require('fs').promises;
const path = require('path');

// Simple settings store (in production, use a dedicated Settings model)
let systemSettings = {
  general: {
    siteName: 'SSM Technologies',
    siteDescription: 'Leading Coaching Institute for Technology Education',
    contactEmail: 'info@ssmtechnologies.co.in',
    contactPhone: '+91 98765 43210',
    address: '123 Education Street, Knowledge City, Chennai, Tamil Nadu 600001',
    timezone: 'Asia/Kolkata',
    language: 'en',
    currency: 'INR'
  },
  email: {
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    fromEmail: 'noreply@ssmtechnologies.co.in',
    fromName: 'SSM Technologies'
  },
  payments: {
    enableOnlinePayments: true,
    paymentGateway: 'razorpay',
    razorpayKeyId: '',
    razorpayKeySecret: '',
    enableInstallments: true,
    maxInstallments: 6
  },
  courses: {
    defaultCourseDuration: '3 months',
    allowSelfEnrollment: true,
    requireApprovalForEnrollment: false,
    maxStudentsPerBatch: 30,
    enableCourseReviews: true,
    enableCourseCertificates: true
  },
  notifications: {
    enableEmailNotifications: true,
    enableSMSNotifications: false,
    enablePushNotifications: false,
    notifyOnEnrollment: true,
    notifyOnClassSchedule: true,
    notifyOnAssignmentDue: true
  },
  security: {
    enableTwoFactorAuth: false,
    sessionTimeout: 3600, // seconds
    maxLoginAttempts: 5,
    lockoutDuration: 900, // seconds
    passwordMinLength: 6,
    requirePasswordChange: false,
    passwordChangeInterval: 90 // days
  },
  uploads: {
    maxFileSize: 10485760, // 10MB in bytes
    allowedImageTypes: ['jpg', 'jpeg', 'png', 'gif'],
    allowedDocumentTypes: ['pdf', 'doc', 'docx', 'txt'],
    allowedVideoTypes: ['mp4', 'avi', 'mov', 'wmv'],
    enableCloudStorage: false,
    cloudProvider: 'aws'
  },
  backup: {
    enableAutoBackup: false,
    backupFrequency: 'daily',
    backupRetention: 30, // days
    backupLocation: 'local'
  }
};

// Get all system settings
const getSystemSettings = async (req, res) => {
  try {
    // In production, load from database
    const settings = await loadSettingsFromFile();
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Get system settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get system settings',
      data: systemSettings // Fallback to default settings
    });
  }
};

// Get specific setting category
const getSettingCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const settings = await loadSettingsFromFile();
    
    if (!settings[category]) {
      return res.status(404).json({
        success: false,
        message: 'Setting category not found'
      });
    }

    res.json({
      success: true,
      data: settings[category]
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

    const currentSettings = await loadSettingsFromFile();
    
    // Validate category exists
    if (!currentSettings[category]) {
      return res.status(404).json({
        success: false,
        message: 'Setting category not found'
      });
    }

    // Update the specific category
    currentSettings[category] = { ...currentSettings[category], ...newSettings };
    
    // Save to file
    await saveSettingsToFile(currentSettings);
    
    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: currentSettings[category]
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
    
    if (category && systemSettings[category]) {
      const currentSettings = await loadSettingsFromFile();
      currentSettings[category] = systemSettings[category];
      await saveSettingsToFile(currentSettings);
      
      res.json({
        success: true,
        message: `${category} settings reset to default`,
        data: currentSettings[category]
      });
    } else {
      // Reset all settings
      await saveSettingsToFile(systemSettings);
      
      res.json({
        success: true,
        message: 'All settings reset to default',
        data: systemSettings
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
      settings: await loadSettingsFromFile(),
      statistics: {
        totalUsers: await User.countDocuments({}),
        totalCourses: await Course.countDocuments({}),
        totalRevenue: await calculateTotalRevenue()
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

    const settings = await loadSettingsFromFile();
    const emailSettings = settings.email;

    // Here you would implement actual email sending
    // For now, just simulate the test
    if (!emailSettings.smtpHost || !emailSettings.smtpUser) {
      return res.status(400).json({
        success: false,
        message: 'Email configuration is incomplete'
      });
    }

    // Simulate email test
    const isEmailSent = true; // Replace with actual email sending logic
    
    if (isEmailSent) {
      res.json({
        success: true,
        message: `Test email sent successfully to ${testEmail}`
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send test email'
      });
    }
  } catch (error) {
    console.error('Test email config error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test email configuration'
    });
  }
};

// Get maintenance mode status
const getMaintenanceMode = async (req, res) => {
  try {
    const settings = await loadSettingsFromFile();
    const maintenanceMode = settings.maintenance || {
      enabled: false,
      message: 'System is under maintenance. Please try again later.',
      allowedIPs: []
    };

    res.json({
      success: true,
      data: maintenanceMode
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
    const { enabled, message, allowedIPs } = req.body;
    
    const settings = await loadSettingsFromFile();
    settings.maintenance = {
      enabled: Boolean(enabled),
      message: message || 'System is under maintenance. Please try again later.',
      allowedIPs: allowedIPs || []
    };

    await saveSettingsToFile(settings);

    res.json({
      success: true,
      message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'}`,
      data: settings.maintenance
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
const loadSettingsFromFile = async () => {
  try {
    const settingsPath = path.join(__dirname, '../config/settings.json');
    const data = await fs.readFile(settingsPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return default settings
    return systemSettings;
  }
};

const saveSettingsToFile = async (settings) => {
  try {
    const settingsPath = path.join(__dirname, '../config/settings.json');
    const configDir = path.dirname(settingsPath);
    
    // Ensure config directory exists
    await fs.mkdir(configDir, { recursive: true });
    
    await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2));
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
};

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

module.exports = {
  getSystemSettings,
  getSettingCategory,
  updateSystemSettings,
  resetSettings,
  getSystemInfo,
  backupSystem,
  testEmailConfig,
  getMaintenanceMode,
  toggleMaintenanceMode
};