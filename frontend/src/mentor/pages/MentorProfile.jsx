import React, { useEffect, useState } from 'react';
import { 
  User, 
  Mail, 
  Clock, 
  Users, 
  Star, 
  Edit3, 
  Save, 
  X,
  MapPin,
  Briefcase,
  Award,
  Calendar,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

import LoadingSpinner, { CardSpinner, ButtonSpinner } from '../components/common/LoadingSpinner.jsx';
import MentorBreadcrumb from '../layout/MentorBreadcrumb.jsx';
import { COLORS, EXPERIENCE_LEVELS } from '../utils/constants.js';

// ===================================
// MOCK DATA (Replace with API calls)
// ===================================
const MOCK_MENTOR_PROFILE = {
  id: 1,
  user: {
    id: 1,
    email: 'mentor@example.com',
    first_name: 'John',
    last_name: 'Doe',
    full_name: 'John Doe',
    default_dp_color: '#2563eb'
  },
  bio: 'Experienced software engineer with 8+ years in full-stack development. Passionate about mentoring junior developers and helping them grow their careers. Specialized in JavaScript, React, Node.js, and modern web development practices.',
  expertise_areas: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker'],
  experience_level: 'senior',
  max_students: 12,
  current_student_count: 3,
  hourly_rate: '85.00',
  timezone: 'America/New_York',
  status: 'active',
  rating: 4.8,
  total_reviews: 24,
  can_accept_students: true,
  availability_schedule: {
    monday: ['09:00', '17:00'],
    tuesday: ['09:00', '17:00'],
    wednesday: ['09:00', '17:00'],
    thursday: ['09:00', '17:00'],
    friday: ['09:00', '15:00']
  },
  created_at: '2023-01-15T10:00:00Z'
};

/**
 * MentorProfile - Profile management component for mentors
 * 
 * This component allows mentors to:
 * - View their profile information
 * - Edit profile details
 * - Update professional settings
 * - View statistics and performance metrics
 * 
 * @returns {JSX.Element} The mentor profile page
 */
const MentorProfile = () => {
  // ===================================
  // STATE MANAGEMENT
  // ===================================
  const [mentorProfile, setMentorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});

  // ===================================
  // API INTEGRATION (Currently using mock data)
  // TODO: Replace mock data with actual API calls
  // ===================================

  /**
   * Fetches mentor profile data from the backend API
   * Currently uses mock data - replace with actual API call
   */
  const fetchMentorProfile = async () => {
    try {
      setError(null);
      setLoading(true);
      // Replace with your real backend endpoint for mentor profile
      // Example: /mentor/api/mentor-profiles/me/ or similar
      const response = await fetch('http://127.0.0.1:8000/mentor/api/mentor-profiles/me/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Adjust this according to your backend response structure
      if (data.data) {
        setMentorProfile(data.data);
        initializeFormData(data.data);
      } else if (data.results) {
        setMentorProfile(data.results);
        initializeFormData(data.results);
      } else if (Array.isArray(data)) {
        setMentorProfile(data);
        initializeFormData(data);
      } else {
        setMentorProfile(null);
        initializeFormData({});
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
      setError(err.message || 'Failed to load mentor profile');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Updates mentor profile data via API
   * Currently uses mock data - replace with actual API call
   */
  const updateMentorProfile = async (profileData) => {
    try {
      setSaving(true);
      setError(null);

      // MOCK DATA USAGE
      // TODO: Replace this with actual API call
      // Example API call (commented out):
      /*
      const response = await fetch('http://127.0.0.1:8000/mentor/api/mentor-profiles/me/', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${localStorage.getItem('auth_token')}`, // Add if authentication is needed
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setMentorProfile(data.data);
        setIsEditing(false);
        // Show success message
        console.log('Profile updated successfully');
      } else {
        throw new Error(data.message || 'Failed to update mentor profile');
      }
      */

      // Simulate API delay for realistic UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update mock data
      const updatedProfile = { ...mentorProfile, ...profileData };
      setMentorProfile(updatedProfile);
      setIsEditing(false);
      
      // Show success feedback (in real app, use toast notification)
      console.log('Profile updated successfully');
      
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.message || 'Failed to update mentor profile');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Initializes form data with current profile values
   * @param {Object} profile - The mentor profile data
   */
  const initializeFormData = (profile) => {
    setFormData({
      bio: profile.bio || '',
      expertise_areas: profile.expertise_areas || [],
      experience_level: profile.experience_level || 'junior',
      max_students: profile.max_students || 10,
      hourly_rate: profile.hourly_rate || '',
      timezone: profile.timezone || 'UTC',
      status: profile.status || 'active',
    });
  };

  /**
   * Handles form input changes
   * @param {string} field - The field name to update
   * @param {any} value - The new value
   */
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * Handles expertise areas input (comma-separated string to array)
   * @param {string} value - Comma-separated expertise areas
   */
  const handleExpertiseChange = (value) => {
    const areas = value.split(',').map(area => area.trim()).filter(Boolean);
    handleInputChange('expertise_areas', areas);
  };

  /**
   * Saves the profile changes
   */
  const handleSave = async () => {
    await updateMentorProfile(formData);
  };

  /**
   * Cancels editing and resets form data
   */
  const handleCancel = () => {
    if (mentorProfile) {
      initializeFormData(mentorProfile);
    }
    setIsEditing(false);
    setError(null);
  };

  // ===================================
  // COMPONENT LIFECYCLE
  // ===================================
  useEffect(() => {
    fetchMentorProfile();
  }, []);

  // ===================================
  // ERROR HANDLING & LOADING STATES
  // ===================================
  
  // Show loading spinner while fetching data
  if (loading && !mentorProfile) {
    return (
      <div className="space-y-6">
        <MentorBreadcrumb />
        <CardSpinner text="Loading mentor profile..." />
      </div>
    );
  }

  // Show error state with retry option
  if (error && !mentorProfile) {
    return (
      <div className="space-y-6">
        <MentorBreadcrumb />
        <div className="bg-white rounded-lg border border-red-200 p-8 text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Profile</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchMentorProfile}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
          >
            <RefreshCw size={16} />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  // ===================================
  // RENDER COMPONENT
  // ===================================
  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <MentorBreadcrumb />

      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">
            Manage your mentor profile and preferences.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Edit3 size={16} />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                {saving ? <ButtonSpinner size={16} /> : <Save size={16} />}
                <span>Save</span>
              </button>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                <X size={16} />
                <span>Cancel</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error Message Display */}
      {error && mentorProfile && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle size={16} className="text-red-500" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Profile Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Basic Info & Professional Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h2>
            
            <div className="space-y-6">
              {/* Profile Picture and Name */}
              <div className="flex items-center space-x-4">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
                  style={{ backgroundColor: mentorProfile?.user?.default_dp_color || COLORS.PRIMARY }}
                >
                  {mentorProfile?.user?.first_name?.charAt(0) || 'M'}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {mentorProfile?.user?.full_name || 'Mentor'}
                  </h3>
                  <p className="text-gray-500 flex items-center space-x-1">
                    <Mail size={16} />
                    <span>{mentorProfile?.user?.email}</span>
                  </p>
                </div>
              </div>

              {/* Bio Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                {isEditing ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tell others about your background and experience..."
                  />
                ) : (
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {mentorProfile?.bio || 'No bio provided yet.'}
                  </p>
                )}
              </div>

              {/* Expertise Areas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expertise Areas
                </label>
                {isEditing ? (
                  <div>
                    <input
                      type="text"
                      value={formData.expertise_areas?.join(', ') || ''}
                      onChange={(e) => handleExpertiseChange(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., JavaScript, React, Node.js, Python"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Separate multiple areas with commas
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(mentorProfile?.expertise_areas) && mentorProfile.expertise_areas.length > 0 ? (
                      mentorProfile.expertise_areas.map((area, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                        >
                          {area}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500">No expertise areas specified.</span>
                    )}
                  </div>
                )}
              </div>

              {/* Experience Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Level
                </label>
                {isEditing ? (
                  <select
                    value={formData.experience_level}
                    onChange={(e) => handleInputChange('experience_level', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.entries(EXPERIENCE_LEVELS).map(([key, level]) => (
                      <option key={key} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Award size={16} style={{ color: EXPERIENCE_LEVELS[mentorProfile?.experience_level?.toUpperCase()]?.color || COLORS.SECONDARY }} />
                    <span className="font-medium">
                      {EXPERIENCE_LEVELS[mentorProfile?.experience_level?.toUpperCase()]?.label || 'Not specified'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Professional Settings Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Professional Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Max Students */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Students
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.max_students}
                    onChange={(e) => handleInputChange('max_students', parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <Users size={16} className="text-gray-500" />
                    <span className="font-medium">{mentorProfile?.max_students || 10} students</span>
                  </div>
                )}
              </div>

              {/* Hourly Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hourly Rate (Optional)
                </label>
                {isEditing ? (
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.hourly_rate}
                      onChange={(e) => handleInputChange('hourly_rate', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Briefcase size={16} className="text-gray-500" />
                    <span className="font-medium">
                      {mentorProfile?.hourly_rate ? `$${mentorProfile.hourly_rate}/hr` : 'Not specified'}
                    </span>
                  </div>
                )}
              </div>

              {/* Timezone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                {isEditing ? (
                  <select
                    value={formData.timezone}
                    onChange={(e) => handleInputChange('timezone', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Paris</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                    <option value="Asia/Shanghai">Shanghai</option>
                    <option value="Asia/Kolkata">India</option>
                  </select>
                ) : (
                  <div className="flex items-center space-x-2">
                    <MapPin size={16} className="text-gray-500" />
                    <span className="font-medium">{mentorProfile?.timezone || 'UTC'}</span>
                  </div>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                {isEditing ? (
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="on_leave">On Leave</option>
                  </select>
                ) : (
                  <span 
                    className="inline-flex px-3 py-1 rounded-full text-sm font-medium capitalize"
                    style={{
                      backgroundColor: mentorProfile?.status === 'active' ? '#dcfce7' : '#fef3c7',
                      color: mentorProfile?.status === 'active' ? '#166534' : '#a16207'
                    }}
                  >
                    {mentorProfile?.status || 'active'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Stats and Activity */}
        <div className="space-y-6">
          {/* Statistics Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Current Students</span>
                <span className="font-semibold text-gray-900">
                  {mentorProfile?.current_student_count || 0}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Average Rating</span>
                <div className="flex items-center space-x-1">
                  <Star size={16} className="text-yellow-400 fill-current" />
                  <span className="font-semibold text-gray-900">
                    {mentorProfile?.rating || '0.0'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Reviews</span>
                <span className="font-semibold text-gray-900">
                  {mentorProfile?.total_reviews || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Member Since</span>
                <span className="font-semibold text-gray-900">
                  {mentorProfile?.created_at 
                    ? new Date(mentorProfile.created_at).toLocaleDateString()
                    : 'N/A'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Availability Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Availability</h3>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Clock size={16} className="text-gray-500" />
                <span className="text-sm text-gray-600">
                  Can accept {mentorProfile?.can_accept_students ? 'new students' : 'no new students'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Calendar size={16} className="text-gray-500" />
                <span className="text-sm text-gray-600">
                  Timezone: {mentorProfile?.timezone || 'UTC'}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Users size={16} className="text-gray-500" />
                <span className="text-sm text-gray-600">
                  {mentorProfile?.current_student_count || 0} of {mentorProfile?.max_students || 10} students
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorProfile; 