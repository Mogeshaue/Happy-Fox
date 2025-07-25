import React, { useEffect, useState } from 'react';
import { Card, Avatar, Typography, Box } from '@mui/material';
import Loader from '../components/common/Loader';

const Profile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Assuming the Google Auth user info is saved in localStorage after login
    const storedUser = localStorage.getItem('googleUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  if (!user) {
    return <Loader />;
  }

  return (
    <Box sx={{ p: { xs: 2, md: 6 }, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" fontWeight={700} mb={4} color="text.primary">
        Student Profile
      </Typography>
      <Card sx={{ p: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
        <Avatar src={user.picture} alt="Profile" sx={{ width: 96, height: 96, border: 2, borderColor: 'primary.main' }} />
        <Box>
          <Typography variant="h6">{user.name}</Typography>
          <Typography color="text.secondary">{user.email}</Typography>
        </Box>
      </Card>
    </Box>
  );
};

export default Profile;
