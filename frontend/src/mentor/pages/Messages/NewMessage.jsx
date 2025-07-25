import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import baseAPI from '../../services/baseAPI.js';

const NewMessage = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [assignmentId, setAssignmentId] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch assignments for dropdown
    const fetchAssignments = async () => {
      try {
        const data = await baseAPI.get('/assignments/');
        setAssignments(data.data || data.results || []);
      } catch (err) {
        setAssignments([]);
      }
    };
    fetchAssignments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://127.0.0.1:8000/mentor/api/messages/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assignment_id: assignmentId,
          content,
          message_type: 'text',
        }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to send message');
      }
      const data = await response.json();
      // Redirect to the new thread (assume thread id is assignment id)
      navigate(`/mentor/messages/${assignmentId}`);
    } catch (err) {
      setError(err.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Send New Message</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Select Student/Assignment</label>
          <select
            value={assignmentId}
            onChange={e => setAssignmentId(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Select...</option>
            {assignments.map(a => (
              <option key={a.id} value={a.id}>
                {a.student?.full_name || a.student?.email || 'Student'} - {a.cohort?.name || 'Cohort'}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Message</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
            rows={4}
          />
        </div>
        {error && <div className="text-red-600">{error}</div>}
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
};

export default NewMessage; 