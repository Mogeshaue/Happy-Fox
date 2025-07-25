import { useState, useEffect } from 'react';
import axios from 'axios';

const useAdminDashboardData = () => {
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    axios.get('/api/admin/dashboard/')
      .then((res) => {
        setStats(res.data.stats);
        setStudents(res.data.recent_students);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load dashboard data');
      })
      .finally(() => setLoading(false));
  }, []);

  return { stats, students, loading, error };
};

export default useAdminDashboardData; 