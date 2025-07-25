/**
 * System Configuration Component
 * Single Responsibility: Manage system settings and configuration
 * Following SOLID principles and mentor patterns
 */

import React, { useEffect, useState } from 'react';
import { 
  Settings, 
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Database,
  Shield,
  Bell,
  Globe,
  Key,
  Upload
} from 'lucide-react';
import useAdminFlowStore from '../store/adminFlowStore.js';
import { COLORS } from '../utils/constants.js';

// Loading Spinner Component
const LoadingSpinner = ({ text = 'Loading...' }) => (
  <div className="flex items-center justify-center h-64">
    <div className="flex flex-col items-center space-y-2">
      <div className="animate-spin rounded-full w-8 h-8 border-b-2 border-blue-600"></div>
      <span className="text-gray-600">{text}</span>
    </div>
  </div>
);

// Configuration Section Component
const ConfigSection = ({ title, icon: Icon, children, className = '' }) => (
  <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
    <div className="p-6 border-b border-gray-100">
      <div className="flex items-center space-x-3">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${COLORS.PRIMARY}15` }}
        >
          <Icon size={20} style={{ color: COLORS.PRIMARY }} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

// Form Field Component
const FormField = ({ label, description, children, required = false }) => (
  <div className="space-y-2">
    <div>
      <label className="text-sm font-medium text-gray-900">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {description && (
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      )}
    </div>
    {children}
  </div>
);

const SystemConfiguration = () => {
  const {
    systemConfig,
    isLoading,
    error,
    fetchSystemConfig,
    updateSystemConfig
  } = useAdminFlowStore();

  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch system config on component mount
  useEffect(() => {
    fetchSystemConfig();
  }, [fetchSystemConfig]);

  // Update form data when systemConfig changes
  useEffect(() => {
    if (systemConfig) {
      setFormData({
        // General Settings
        site_name: systemConfig.site_name || 'Admin Flow System',
        site_description: systemConfig.site_description || '',
        maintenance_mode: systemConfig.maintenance_mode || false,
        
        // Security Settings
        session_timeout: systemConfig.session_timeout || 3600,
        password_min_length: systemConfig.password_min_length || 8,
        enable_2fa: systemConfig.enable_2fa || false,
        
        // Notification Settings
        email_notifications: systemConfig.email_notifications || true,
        push_notifications: systemConfig.push_notifications || false,
        notification_retention_days: systemConfig.notification_retention_days || 30,
        
        // API Settings
        api_rate_limit: systemConfig.api_rate_limit || 1000,
        api_key_expiry_days: systemConfig.api_key_expiry_days || 365,
        
        // Storage Settings
        max_file_size_mb: systemConfig.max_file_size_mb || 50,
        storage_cleanup_days: systemConfig.storage_cleanup_days || 90,
        
        // Integration Settings
        openai_api_key: systemConfig.openai_api_key || '',
        enable_analytics: systemConfig.enable_analytics || true,
      });
    }
  }, [systemConfig]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    
    try {
      await updateSystemConfig(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save configuration:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = async () => {
    await fetchSystemConfig();
  };

  if (isLoading && !systemConfig) {
    return <LoadingSpinner text="Loading system configuration..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Configuration</h1>
          <p className="text-gray-600 mt-1">
            Configure system settings and preferences
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save size={16} className={saving ? 'animate-pulse' : ''} />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="text-green-600" size={20} />
            <p className="text-green-800">Configuration saved successfully!</p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="text-red-600" size={20} />
            <p className="text-red-800">Error: {error}</p>
          </div>
        </div>
      )}

      {/* Configuration Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <ConfigSection title="General Settings" icon={Globe}>
          <div className="space-y-4">
            <FormField label="Site Name" description="The name of your application">
              <input
                type="text"
                value={formData.site_name || ''}
                onChange={(e) => handleInputChange('site_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </FormField>

            <FormField label="Site Description" description="Brief description of your application">
              <textarea
                value={formData.site_description || ''}
                onChange={(e) => handleInputChange('site_description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </FormField>

            <FormField label="Maintenance Mode" description="Enable to temporarily disable access">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.maintenance_mode || false}
                  onChange={(e) => handleInputChange('maintenance_mode', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Enable maintenance mode</span>
              </label>
            </FormField>
          </div>
        </ConfigSection>

        {/* Security Settings */}
        <ConfigSection title="Security Settings" icon={Shield}>
          <div className="space-y-4">
            <FormField label="Session Timeout (seconds)" description="How long users stay logged in">
              <input
                type="number"
                value={formData.session_timeout || ''}
                onChange={(e) => handleInputChange('session_timeout', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </FormField>

            <FormField label="Minimum Password Length" description="Minimum characters required for passwords">
              <input
                type="number"
                value={formData.password_min_length || ''}
                onChange={(e) => handleInputChange('password_min_length', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </FormField>

            <FormField label="Two-Factor Authentication" description="Require 2FA for admin users">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.enable_2fa || false}
                  onChange={(e) => handleInputChange('enable_2fa', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Enable 2FA requirement</span>
              </label>
            </FormField>
          </div>
        </ConfigSection>

        {/* Notification Settings */}
        <ConfigSection title="Notification Settings" icon={Bell}>
          <div className="space-y-4">
            <FormField label="Email Notifications" description="Send notifications via email">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.email_notifications || false}
                  onChange={(e) => handleInputChange('email_notifications', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Enable email notifications</span>
              </label>
            </FormField>

            <FormField label="Push Notifications" description="Send browser push notifications">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.push_notifications || false}
                  onChange={(e) => handleInputChange('push_notifications', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Enable push notifications</span>
              </label>
            </FormField>

            <FormField label="Notification Retention (days)" description="How long to keep notifications">
              <input
                type="number"
                value={formData.notification_retention_days || ''}
                onChange={(e) => handleInputChange('notification_retention_days', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </FormField>
          </div>
        </ConfigSection>

        {/* API Settings */}
        <ConfigSection title="API Settings" icon={Key}>
          <div className="space-y-4">
            <FormField label="API Rate Limit (requests/hour)" description="Maximum API requests per hour">
              <input
                type="number"
                value={formData.api_rate_limit || ''}
                onChange={(e) => handleInputChange('api_rate_limit', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </FormField>

            <FormField label="API Key Expiry (days)" description="How long API keys remain valid">
              <input
                type="number"
                value={formData.api_key_expiry_days || ''}
                onChange={(e) => handleInputChange('api_key_expiry_days', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </FormField>

            <FormField label="OpenAI API Key" description="API key for AI-powered features">
              <input
                type="password"
                value={formData.openai_api_key || ''}
                onChange={(e) => handleInputChange('openai_api_key', e.target.value)}
                placeholder="sk-..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </FormField>
          </div>
        </ConfigSection>

        {/* Storage Settings */}
        <ConfigSection title="Storage Settings" icon={Database}>
          <div className="space-y-4">
            <FormField label="Max File Size (MB)" description="Maximum size for uploaded files">
              <input
                type="number"
                value={formData.max_file_size_mb || ''}
                onChange={(e) => handleInputChange('max_file_size_mb', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </FormField>

            <FormField label="Storage Cleanup (days)" description="Delete old files after this many days">
              <input
                type="number"
                value={formData.storage_cleanup_days || ''}
                onChange={(e) => handleInputChange('storage_cleanup_days', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </FormField>

            <FormField label="Analytics" description="Enable system analytics tracking">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.enable_analytics || false}
                  onChange={(e) => handleInputChange('enable_analytics', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Enable analytics tracking</span>
              </label>
            </FormField>
          </div>
        </ConfigSection>

        {/* Backup & Maintenance */}
        <ConfigSection title="Backup & Maintenance" icon={Upload} className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex flex-col items-center space-y-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Database size={24} className="text-blue-600" />
              <span className="text-sm font-medium text-gray-900">Backup Database</span>
              <span className="text-xs text-gray-500">Create a full backup</span>
            </button>
            
            <button className="flex flex-col items-center space-y-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Upload size={24} className="text-green-600" />
              <span className="text-sm font-medium text-gray-900">Export Settings</span>
              <span className="text-xs text-gray-500">Download configuration</span>
            </button>
            
            <button className="flex flex-col items-center space-y-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <RefreshCw size={24} className="text-orange-600" />
              <span className="text-sm font-medium text-gray-900">Clear Cache</span>
              <span className="text-xs text-gray-500">Clear system cache</span>
            </button>
          </div>
        </ConfigSection>
      </div>
    </div>
  );
};

export default SystemConfiguration;
