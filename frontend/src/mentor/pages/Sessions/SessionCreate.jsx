import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import baseAPI from '../../services/baseAPI.js';

const SessionCreate = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    scheduled_at: '',
    duration_minutes: 60,
    meeting_link: '',
    assignment_id: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await baseAPI.post('/sessions/', form);
      navigate('/mentor/sessions');
    } catch (err) {
      setError(err.message || 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Schedule New Session</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Title</label>
          <input name="title" value={form.title} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block font-medium mb-1">Scheduled At</label>
          <input type="datetime-local" name="scheduled_at" value={form.scheduled_at} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block font-medium mb-1">Duration (minutes)</label>
          <input type="number" name="duration_minutes" value={form.duration_minutes} onChange={handleChange} min="1" className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block font-medium mb-1">Meeting Link</label>
          <input name="meeting_link" value={form.meeting_link} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block font-medium mb-1">Assignment ID</label>
          <input
            name="assignment_id"
            type="number"
            value={form.assignment_id}
            onChange={e => setForm({ ...form, assignment_id: e.target.value ? parseInt(e.target.value, 10) : '' })}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
        {error && <div className="text-red-600">{error}</div>}
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
          {loading ? 'Creating...' : 'Create Session'}
        </button>
      </form>
    </div>
  );
};

export default SessionCreate; 