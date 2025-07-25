import React from 'react';
import { Typography, Box, Avatar } from '@mui/material';

const Mnavbar = () => {
  return (
    <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
      <Typography variant="h6" fontWeight={700} color="inherit">
        Mentor Panel
      </Typography>
      <Box display="flex" alignItems="center" gap={2}>
        <Typography color="text.secondary">Mentor</Typography>
        <Avatar src="https://via.placeholder.com/32" alt="profile" />
      </Box>
    </Box>
  );
};

export default Mnavbar;
