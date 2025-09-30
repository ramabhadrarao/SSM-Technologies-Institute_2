import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';

interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  timezone: string;
  language: string;
  currency: string;
}

interface EmailSettings {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
}

interface PaymentSettings {
  enableOnlinePayments: boolean;
  paymentGateway: string;
  razorpayKeyId: string;
  razorpayKeySecret: string;
  enableInstallments: boolean;
  maxInstallments: number;
}

interface CourseSettings {
  defaultCourseDuration: string;
  allowSelfEnrollment: boolean;
  requireApprovalForEnrollment: boolean;
  maxStudentsPerBatch: number;
  enableCourseReviews: boolean;
  enableCourseCertificates: boolean;
}

interface NotificationSettings {
  enableEmailNotifications: boolean;
  enableSMSNotifications: boolean;
  enablePushNotifications: boolean;
  notifyOnEnrollment: boolean;
  notifyOnClassSchedule: boolean;
  notifyOnAssignmentDue: boolean;
}

interface SecuritySettings {
  enableTwoFactorAuth: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  lockoutDuration: number;
  passwordMinLength: number;
  requirePasswordChange: boolean;
  passwordChangeInterval: number;
}

interface UploadSettings {
  maxFileSize: number;
  allowedImageTypes: string[];
  allowedDocumentTypes: string[];
  allowedVideoTypes: string[];
  enableCloudStorage: boolean;
  cloudProvider: string;
}

interface BackupSettings {
  enableAutoBackup: boolean;
  backupFrequency: string;
  backupRetention: number;
  backupLocation: string;
}

interface AllSettings {
  general: GeneralSettings;
  email: EmailSettings;
  payments: PaymentSettings;
  courses: CourseSettings;
  notifications: NotificationSettings;
  security: SecuritySettings;
  uploads: UploadSettings;
  backup: BackupSettings;
}

interface UseSettingsReturn {
  generalSettings: GeneralSettings | null;
  allSettings: AllSettings | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useSettings = (): UseSettingsReturn => {
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings | null>(null);
  const [allSettings, setAllSettings] = useState<AllSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Always fetch general settings from public endpoint (no auth required)
      const generalData = await apiClient.getPublicSettingCategory('general');
      setGeneralSettings(generalData);
      
      // Try to fetch all settings from authenticated endpoint
      try {
        const allData = await apiClient.getSystemSettings();
        setAllSettings(allData);
      } catch (authError: any) {
        console.log('Authenticated settings fetch failed, using public settings only:', authError.message);
        // If authenticated request fails, create allSettings with just general data
        setAllSettings({
          general: generalData,
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
        });
      }
    } catch (err: any) {
      console.error('Error fetching settings:', err);
      setError(err.message || 'Failed to fetch settings');
      
      // Set fallback values if all API calls fail
      const fallbackGeneral = {
        siteName: 'SSM Technologies',
        siteDescription: 'Leading Coaching Institute for Technology Education',
        contactEmail: 'info@ssmtechnologies.co.in',
        contactPhone: '+91 98765 43210',
        address: '123 Education Street, Knowledge City, Chennai, Tamil Nadu 600001',
        timezone: 'Asia/Kolkata',
        language: 'en',
        currency: 'INR'
      };
      
      setGeneralSettings(fallbackGeneral);
      setAllSettings({
        general: fallbackGeneral,
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
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    generalSettings,
    allSettings,
    loading,
    error,
    refetch: fetchSettings
  };
};

export default useSettings;