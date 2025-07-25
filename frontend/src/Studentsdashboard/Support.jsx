import React from 'react';
import { Card, Typography, Box, Button } from '@mui/material';

const Support = () => {
  return (
    <Box sx={{ p: { xs: 2, md: 6 }, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" fontWeight={700} mb={4} color="text.primary">
        Support
      </Typography>
      <Card sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" mb={2}>Need help?</Typography>
        <Typography color="text.secondary" mb={3}>
          If you have any questions or need assistance, please contact our support team.
        </Typography>
        <Button variant="contained" color="primary">Contact Support</Button>
      </Card>
    </Box>
  );
};

export default Support;