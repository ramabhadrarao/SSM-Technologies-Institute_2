const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    unique: true,
    enum: ['general', 'email', 'payments', 'courses', 'notifications', 'security', 'uploads', 'backup']
  },
  settings: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  lastModified: {
    type: Date,
    default: Date.now
  },
  modifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for faster queries
settingsSchema.index({ category: 1 });

// Pre-save middleware to update lastModified
settingsSchema.pre('save', function(next) {
  this.lastModified = new Date();
  next();
});

// Static method to get all settings
settingsSchema.statics.getAllSettings = async function() {
  const settingsArray = await this.find({});
  const settingsObject = {};
  
  settingsArray.forEach(setting => {
    settingsObject[setting.category] = setting.settings;
  });
  
  return settingsObject;
};

// Static method to get settings by category
settingsSchema.statics.getByCategory = async function(category) {
  const setting = await this.findOne({ category });
  return setting ? setting.settings : null;
};

// Static method to update settings by category
settingsSchema.statics.updateByCategory = async function(category, newSettings, userId = null) {
  const updateData = {
    settings: newSettings,
    lastModified: new Date()
  };
  
  if (userId) {
    updateData.modifiedBy = userId;
  }
  
  const setting = await this.findOneAndUpdate(
    { category },
    updateData,
    { 
      new: true, 
      upsert: true,
      runValidators: true
    }
  );
  
  return setting.settings;
};

// Static method to reset settings to default
settingsSchema.statics.resetToDefault = async function(category = null) {
  const defaultSettings = {
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
      sessionTimeout: 3600,
      maxLoginAttempts: 5,
      lockoutDuration: 900,
      passwordMinLength: 6,
      requirePasswordChange: false,
      passwordChangeInterval: 90
    },
    uploads: {
      maxFileSize: 10485760,
      allowedImageTypes: ['jpg', 'jpeg', 'png', 'gif'],
      allowedDocumentTypes: ['pdf', 'doc', 'docx', 'txt'],
      allowedVideoTypes: ['mp4', 'avi', 'mov', 'wmv'],
      enableCloudStorage: false,
      cloudProvider: 'aws'
    },
    backup: {
      enableAutoBackup: false,
      backupFrequency: 'daily',
      backupRetention: 30,
      backupLocation: 'local'
    }
  };
  
  if (category && defaultSettings[category]) {
    // Reset specific category
    await this.updateByCategory(category, defaultSettings[category]);
    return defaultSettings[category];
  } else {
    // Reset all categories
    const promises = Object.keys(defaultSettings).map(cat => 
      this.updateByCategory(cat, defaultSettings[cat])
    );
    await Promise.all(promises);
    return defaultSettings;
  }
};

// Static method to initialize default settings if none exist
settingsSchema.statics.initializeDefaults = async function() {
  const existingSettings = await this.find({});
  
  if (existingSettings.length === 0) {
    console.log('Initializing default settings...');
    await this.resetToDefault();
    console.log('Default settings initialized successfully');
  }
};

module.exports = mongoose.model('Settings', settingsSchema);