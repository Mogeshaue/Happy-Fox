import { useState, useEffect } from 'react';
import axios from 'axios';

const useMentorDashboardData = () => {
  const [stats, setStats] = useState(null);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    axios.get('/api/mentor/dashboard/')
      .then((res) => {
        setStats(res.data.stats);
        setMentors(res.data.mentors);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load mentor dashboard data');
      })
      .finally(() => setLoading(false));
  }, []);

  return { stats, mentors, loading, error };
};

export default useMentorDashboardData; 