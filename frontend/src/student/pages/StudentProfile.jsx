import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, BookOpen, Target, Settings, Save } from 'lucide-react';
import StudentAPI from '../services/StudentAPI';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await StudentAPI.getProfile();
      setProfile(data);
      setFormData({
        bio: data.bio || '',
        learning_style: data.learning_style || 'mixed',
        preferred_difficulty: data.preferred_difficulty || 'intermediate',
        study_hours_per_week: data.study_hours_per_week || 10,
        timezone: data.timezone || 'UTC',
        learning_objectives: data.learning_objectives || '',
        interests: data.interests || '',
        career_goals: data.career_goals || ''
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updatedProfile = await StudentAPI.updateProfile(formData);
      setProfile(updatedProfile);
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData({
      bio: profile.bio || '',
      learning_style: profile.learning_style || 'mixed',
      preferred_difficulty: profile.preferred_difficulty || 'intermediate',
      study_hours_per_week: profile.study_hours_per_week || 10,
      timezone: profile.timezone || 'UTC',
      learning_objectives: profile.learning_objectives || '',
      interests: profile.interests || '',
      career_goals: profile.career_goals || ''
    });
  };

  if (loading) {
    return <LoadingSpinner message="Loading your profile..." />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {profile?.user?.first_name?.charAt(0) || 'S'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {profile?.user?.first_name} {profile?.user?.last_name}
              </h1>
              <p className="text-gray-600">{profile?.user?.email}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {profile?.status || 'Active'}
                </span>
                <span className="text-sm text-gray-500">
                  Member since {new Date(profile?.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            {editing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                >
                  <Save size={16} />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Settings size={16} />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Courses</p>
              <p className="text-2xl font-semibold text-gray-900">{profile?.completed_courses || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Study Hours</p>
              <p className="text-2xl font-semibold text-gray-900">{profile?.total_study_hours || 0}h</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Streak</p>
              <p className="text-2xl font-semibold text-gray-900">{profile?.streak_days || 0} days</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <User className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Grade</p>
              <p className="text-2xl font-semibold text-gray-900">{profile?.overall_grade || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              {editing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-gray-600">{profile?.bio || 'No bio provided'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Learning Objectives</label>
              {editing ? (
                <textarea
                  value={formData.learning_objectives}
                  onChange={(e) => setFormData({ ...formData, learning_objectives: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="What are your learning goals?"
                />
              ) : (
                <p className="text-gray-600">{profile?.learning_objectives || 'No objectives set'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Interests</label>
              {editing ? (
                <input
                  type="text"
                  value={formData.interests}
                  onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Web Development, AI, Data Science"
                />
              ) : (
                <p className="text-gray-600">{profile?.interests || 'No interests specified'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Career Goals</label>
              {editing ? (
                <textarea
                  value={formData.career_goals}
                  onChange={(e) => setFormData({ ...formData, career_goals: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="What are your career aspirations?"
                />
              ) : (
                <p className="text-gray-600">{profile?.career_goals || 'No career goals set'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Learning Preferences */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Learning Preferences</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Learning Style</label>
              {editing ? (
                <select
                  value={formData.learning_style}
                  onChange={(e) => setFormData({ ...formData, learning_style: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="visual">Visual</option>
                  <option value="auditory">Auditory</option>
                  <option value="kinesthetic">Kinesthetic</option>
                  <option value="mixed">Mixed</option>
                </select>
              ) : (
                <p className="text-gray-600 capitalize">{profile?.learning_style || 'Mixed'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Difficulty</label>
              {editing ? (
                <select
                  value={formData.preferred_difficulty}
                  onChange={(e) => setFormData({ ...formData, preferred_difficulty: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              ) : (
                <p className="text-gray-600 capitalize">{profile?.preferred_difficulty || 'Intermediate'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Study Hours per Week</label>
              {editing ? (
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={formData.study_hours_per_week}
                  onChange={(e) => setFormData({ ...formData, study_hours_per_week: parseInt(e.target.value) })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-600">{profile?.study_hours_per_week || 10} hours</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
              {editing ? (
                <select
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <p className="text-gray-600">{profile?.timezone || 'UTC'}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
