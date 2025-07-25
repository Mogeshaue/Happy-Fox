import React from 'react';
import { Box, CircularProgress } from '@mui/material';

const Loader = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
    <CircularProgress color="primary" size={48} thickness={4} />
  </Box>
);

export default Loader; 