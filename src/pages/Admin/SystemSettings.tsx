import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  Mail, 
  Shield, 
  Upload, 
  Database,
  Bell,
  CreditCard,
  Globe,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Info,
  Server,
  HardDrive,
  Wifi,
  Lock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

interface SystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    timezone: string;
    language: string;
    currency: string;
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    fromEmail: string;
    fromName: string;
  };
  payments: {
    enableOnlinePayments: boolean;
    paymentGateway: string;
    razorpayKeyId: string;
    razorpayKeySecret: string;
    enableInstallments: boolean;
    maxInstallments: number;
  };
  courses: {
    defaultCourseDuration: string;
    allowSelfEnrollment: boolean;
    requireApprovalForEnrollment: boolean;
    maxStudentsPerBatch: number;
    enableCourseReviews: boolean;
    enableCourseCertificates: boolean;
  };
  notifications: {
    enableEmailNotifications: boolean;
    enableSMSNotifications: boolean;
    enablePushNotifications: boolean;
    notifyOnEnrollment: boolean;
    notifyOnClassSchedule: boolean;
    notifyOnAssignmentDue: boolean;
  };
  security: {
    enableTwoFactorAuth: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    lockoutDuration: number;
    passwordMinLength: number;
    requirePasswordChange: boolean;
    passwordChangeInterval: number;
  };
  uploads: {
    maxFileSize: number;
    allowedImageTypes: string[];
    allowedDocumentTypes: string[];
    allowedVideoTypes: string[];
    enableCloudStorage: boolean;
    cloudProvider: string;
  };
  backup: {
    enableAutoBackup: boolean;
    backupFrequency: string;
    backupRetention: number;
    backupLocation: string;
  };
}

interface SystemInfo {
  version: string;
  environment: string;
  nodeVersion: string;
  uptime: number;
  memoryUsage: any;
  platform: string;
  lastBackup: string | null;
  database: {
    status: string;
    collections: any;
  };
  statistics: any;
}

const AdminSystemSettings: React.FC = () => {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState('general');
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState<any>(null);

  const tabs = [
    { id: 'general', label: 'General', icon: <Globe className="w-4 h-4" /> },
    { id: 'email', label: 'Email', icon: <Mail className="w-4 h-4" /> },
    { id: 'payments', label: 'Payments', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'courses', label: 'Courses', icon: <Settings className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
    { id: 'uploads', label: 'Uploads', icon: <Upload className="w-4 h-4" /> },
    { id: 'backup', label: 'Backup', icon: <Database className="w-4 h-4" /> },
    { id: 'system', label: 'System Info', icon: <Server className="w-4 h-4" /> }
  ];

  useEffect(() => {
    fetchSettings();
    fetchSystemInfo();
    fetchMaintenanceMode();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getSystemSettings();
      setSettings(data);
    } catch (error: any) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemInfo = async () => {
    try {
      const data = await apiClient.getSystemInfo();
      setSystemInfo(data);
    } catch (error) {
      console.error('Error fetching system info:', error);
    }
  };

  const fetchMaintenanceMode = async () => {
    try {
      const data = await apiClient.getMaintenanceMode();
      setMaintenanceMode(data);
    } catch (error) {
      console.error('Error fetching maintenance mode:', error);
    }
  };

  const handleSaveSettings = async (category: string) => {
    if (!settings) return;

    try {
      setSaving(true);
      await apiClient.updateSystemSettings(category, settings[category as keyof SystemSettings]);
      toast.success('Settings saved successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleResetSettings = async (category?: string) => {
    if (!window.confirm(`Are you sure you want to reset ${category || 'all'} settings to default?`)) {
      return;
    }

    try {
      setSaving(true);
      await apiClient.resetSettings(category);
      toast.success('Settings reset successfully');
      fetchSettings();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmailAddress) {
      toast.error('Please enter a test email address');
      return;
    }

    try {
      setSaving(true);
      await apiClient.testEmailConfig(testEmailAddress);
      toast.success('Test email sent successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send test email');
    } finally {
      setSaving(false);
    }
  };

  const handleBackupSystem = async () => {
    try {
      setSaving(true);
      await apiClient.backupSystem();
      toast.success('System backup created successfully');
      fetchSystemInfo();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create backup');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleMaintenanceMode = async () => {
    if (!maintenanceMode) return;

    try {
      setSaving(true);
      await apiClient.toggleMaintenanceMode(!maintenanceMode.enabled);
      toast.success(`Maintenance mode ${!maintenanceMode.enabled ? 'enabled' : 'disabled'}`);
      fetchMaintenanceMode();
    } catch (error: any) {
      toast.error(error.message || 'Failed to toggle maintenance mode');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (category: keyof SystemSettings, field: string, value: any) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [field]: value
      }
    });
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    
    return `${days}d ${hours}h ${minutes}m`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading system settings...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Failed to load settings</p>
          <button onClick={fetchSettings} className="mt-4 text-blue-600 hover:text-blue-800">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center text-blue-600 hover:text-blue-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
                <p className="text-gray-600">Configure system preferences and settings</p>
              </div>
            </div>
            {maintenanceMode && (
              <Button
                variant={maintenanceMode.enabled ? "danger" : "outline"}
                onClick={handleToggleMaintenanceMode}
                loading={saving}
              >
                <Lock className="w-4 h-4 mr-2" />
                {maintenanceMode.enabled ? 'Disable Maintenance' : 'Enable Maintenance'}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      selectedTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {tab.icon}
                    <span className="ml-3">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="p-6">
              {/* General Settings */}
              {selectedTab === 'general' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">General Settings</h2>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => handleResetSettings('general')}
                        loading={saving}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset
                      </Button>
                      <Button
                        onClick={() => handleSaveSettings('general')}
                        loading={saving}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Site Name
                        </label>
                        <input
                          type="text"
                          value={settings.general.siteName}
                          onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Contact Email
                        </label>
                        <input
                          type="email"
                          value={settings.general.contactEmail}
                          onChange={(e) => updateSetting('general', 'contactEmail', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Site Description
                      </label>
                      <textarea
                        rows={3}
                        value={settings.general.siteDescription}
                        onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Contact Phone
                        </label>
                        <input
                          type="tel"
                          value={settings.general.contactPhone}
                          onChange={(e) => updateSetting('general', 'contactPhone', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Timezone
                        </label>
                        <select
                          value={settings.general.timezone}
                          onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Asia/Kolkata">Asia/Kolkata</option>
                          <option value="UTC">UTC</option>
                          <option value="America/New_York">America/New_York</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <textarea
                        rows={3}
                        value={settings.general.address}
                        onChange={(e) => updateSetting('general', 'address', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Email Settings */}
              {selectedTab === 'email' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Email Settings</h2>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => handleResetSettings('email')}
                        loading={saving}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset
                      </Button>
                      <Button
                        onClick={() => handleSaveSettings('email')}
                        loading={saving}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          SMTP Host
                        </label>
                        <input
                          type="text"
                          value={settings.email.smtpHost}
                          onChange={(e) => updateSetting('email', 'smtpHost', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="smtp.gmail.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          SMTP Port
                        </label>
                        <input
                          type="number"
                          value={settings.email.smtpPort}
                          onChange={(e) => updateSetting('email', 'smtpPort', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          SMTP Username
                        </label>
                        <input
                          type="text"
                          value={settings.email.smtpUser}
                          onChange={(e) => updateSetting('email', 'smtpUser', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          SMTP Password
                        </label>
                        <input
                          type="password"
                          value={settings.email.smtpPassword}
                          onChange={(e) => updateSetting('email', 'smtpPassword', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          From Email
                        </label>
                        <input
                          type="email"
                          value={settings.email.fromEmail}
                          onChange={(e) => updateSetting('email', 'fromEmail', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          From Name
                        </label>
                        <input
                          type="text"
                          value={settings.email.fromName}
                          onChange={(e) => updateSetting('email', 'fromName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Test Email */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Test Email Configuration</h3>
                      <div className="flex items-center space-x-3">
                        <input
                          type="email"
                          value={testEmailAddress}
                          onChange={(e) => setTestEmailAddress(e.target.value)}
                          placeholder="Enter test email address"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <Button
                          onClick={handleTestEmail}
                          loading={saving}
                          disabled={!testEmailAddress}
                        >
                          Send Test Email
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {selectedTab === 'security' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Security Settings</h2>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => handleResetSettings('security')}
                        loading={saving}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset
                      </Button>
                      <Button
                        onClick={() => handleSaveSettings('security')}
                        loading={saving}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Session Timeout (seconds)
                        </label>
                        <input
                          type="number"
                          value={settings.security.sessionTimeout}
                          onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Max Login Attempts
                        </label>
                        <input
                          type="number"
                          value={settings.security.maxLoginAttempts}
                          onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Lockout Duration (seconds)
                        </label>
                        <input
                          type="number"
                          value={settings.security.lockoutDuration}
                          onChange={(e) => updateSetting('security', 'lockoutDuration', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Password Min Length
                        </label>
                        <input
                          type="number"
                          value={settings.security.passwordMinLength}
                          onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="enableTwoFactorAuth"
                          checked={settings.security.enableTwoFactorAuth}
                          onChange={(e) => updateSetting('security', 'enableTwoFactorAuth', e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor="enableTwoFactorAuth" className="ml-2 text-sm text-gray-700">
                          Enable Two-Factor Authentication
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="requirePasswordChange"
                          checked={settings.security.requirePasswordChange}
                          onChange={(e) => updateSetting('security', 'requirePasswordChange', e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor="requirePasswordChange" className="ml-2 text-sm text-gray-700">
                          Require Periodic Password Changes
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* System Info */}
              {selectedTab === 'system' && systemInfo && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">System Information</h2>
                    <Button
                      onClick={handleBackupSystem}
                      loading={saving}
                      className="flex items-center"
                    >
                      <Database className="w-4 h-4 mr-2" />
                      Create Backup
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {/* System Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <Card className="p-4 bg-green-50 border-green-200">
                        <div className="flex items-center">
                          <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
                          <div>
                            <p className="text-sm text-green-600">System Status</p>
                            <p className="font-semibold text-green-800">Online</p>
                          </div>
                        </div>
                      </Card>
                      <Card className="p-4 bg-blue-50 border-blue-200">
                        <div className="flex items-center">
                          <Server className="w-8 h-8 text-blue-600 mr-3" />
                          <div>
                            <p className="text-sm text-blue-600">Environment</p>
                            <p className="font-semibold text-blue-800">{systemInfo.environment}</p>
                          </div>
                        </div>
                      </Card>
                      <Card className="p-4 bg-purple-50 border-purple-200">
                        <div className="flex items-center">
                          <Activity className="w-8 h-8 text-purple-600 mr-3" />
                          <div>
                            <p className="text-sm text-purple-600">Uptime</p>
                            <p className="font-semibold text-purple-800">{formatUptime(systemInfo.uptime)}</p>
                          </div>
                        </div>
                      </Card>
                    </div>

                    {/* System Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Details</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Version</span>
                            <span className="font-medium">{systemInfo.version}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Node.js Version</span>
                            <span className="font-medium">{systemInfo.nodeVersion}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Platform</span>
                            <span className="font-medium">{systemInfo.platform}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Database Status</span>
                            <span className={`font-medium ${
                              systemInfo.database.status === 'connected' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {systemInfo.database.status}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Last Backup</span>
                            <span className="font-medium">
                              {systemInfo.lastBackup ? formatDate(systemInfo.lastBackup) : 'Never'}
                            </span>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Memory Usage</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">RSS</span>
                            <span className="font-medium">{formatBytes(systemInfo.memoryUsage.rss)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Heap Total</span>
                            <span className="font-medium">{formatBytes(systemInfo.memoryUsage.heapTotal)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Heap Used</span>
                            <span className="font-medium">{formatBytes(systemInfo.memoryUsage.heapUsed)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">External</span>
                            <span className="font-medium">{formatBytes(systemInfo.memoryUsage.external)}</span>
                          </div>
                        </div>
                      </Card>
                    </div>

                    {/* Database Collections */}
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Database Collections</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(systemInfo.database.collections).map(([collection, count]) => (
                          <div key={collection} className="text-center p-4 bg-gray-50 rounded-lg">
                            <p className="text-2xl font-bold text-blue-600">{count as number}</p>
                            <p className="text-sm text-gray-600 capitalize">{collection}</p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                </div>
              )}

              {/* Other settings tabs would go here */}
              {selectedTab === 'courses' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Course Settings</h2>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => handleResetSettings('courses')}
                        loading={saving}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset
                      </Button>
                      <Button
                        onClick={() => handleSaveSettings('courses')}
                        loading={saving}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Default Course Duration
                        </label>
                        <input
                          type="text"
                          value={settings.courses.defaultCourseDuration}
                          onChange={(e) => updateSetting('courses', 'defaultCourseDuration', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Max Students Per Batch
                        </label>
                        <input
                          type="number"
                          value={settings.courses.maxStudentsPerBatch}
                          onChange={(e) => updateSetting('courses', 'maxStudentsPerBatch', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="allowSelfEnrollment"
                          checked={settings.courses.allowSelfEnrollment}
                          onChange={(e) => updateSetting('courses', 'allowSelfEnrollment', e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor="allowSelfEnrollment" className="ml-2 text-sm text-gray-700">
                          Allow Self Enrollment
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="requireApprovalForEnrollment"
                          checked={settings.courses.requireApprovalForEnrollment}
                          onChange={(e) => updateSetting('courses', 'requireApprovalForEnrollment', e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor="requireApprovalForEnrollment" className="ml-2 text-sm text-gray-700">
                          Require Approval for Enrollment
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="enableCourseReviews"
                          checked={settings.courses.enableCourseReviews}
                          onChange={(e) => updateSetting('courses', 'enableCourseReviews', e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor="enableCourseReviews" className="ml-2 text-sm text-gray-700">
                          Enable Course Reviews
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="enableCourseCertificates"
                          checked={settings.courses.enableCourseCertificates}
                          onChange={(e) => updateSetting('courses', 'enableCourseCertificates', e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor="enableCourseCertificates" className="ml-2 text-sm text-gray-700">
                          Enable Course Certificates
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Placeholder for other tabs */}
              {!['general', 'email', 'security', 'system', 'courses'].includes(selectedTab) && (
                <div className="text-center py-12">
                  <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {tabs.find(t => t.id === selectedTab)?.label} Settings
                  </h3>
                  <p className="text-gray-600">Settings for this section are coming soon.</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSystemSettings;