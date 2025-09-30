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

interface UseSettingsReturn {
  generalSettings: GeneralSettings | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useSettings = (): UseSettingsReturn => {
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getSettingCategory('general');
      setGeneralSettings(data);
    } catch (err: any) {
      console.error('Error fetching settings:', err);
      setError(err.message || 'Failed to fetch settings');
      // Set fallback values if API fails
      setGeneralSettings({
        siteName: 'SSM Technologies',
        siteDescription: 'Leading Coaching Institute for Technology Education',
        contactEmail: 'info@ssmtechnologies.co.in',
        contactPhone: '+91 98765 43210',
        address: '123 Education Street, Knowledge City, Chennai, Tamil Nadu 600001',
        timezone: 'Asia/Kolkata',
        language: 'en',
        currency: 'INR'
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
    loading,
    error,
    refetch: fetchSettings
  };
};

export default useSettings;