
import React from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DescriptionIcon from '@mui/icons-material/Description';

const Studentdashboars = () => {
  return (
    <Box sx={{ p: { xs: 2, md: 6 } }}>
      <Typography variant="h4" fontWeight={700} mb={4} color="text.primary">
        Welcome to Your Dashboard
      </Typography>
      <Grid container spacing={3}>
        {/* My Courses */}
        <Grid item xs={12} md={4}>
          <Card sx={{ transition: '0.2s', '&:hover': { boxShadow: 6 } }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <MenuBookIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h6">My Courses</Typography>
                  <Typography color="text.secondary">View and manage your enrolled courses.</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        {/* Completed Courses */}
        <Grid item xs={12} md={4}>
          <Card sx={{ transition: '0.2s', '&:hover': { boxShadow: 6 } }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h6">Completed Courses</Typography>
                  <Typography color="text.secondary">Track your progress and achievements.</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        {/* Resources */}
        <Grid item xs={12} md={4}>
          <Card sx={{ transition: '0.2s', '&:hover': { boxShadow: 6 } }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <DescriptionIcon color="warning" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h6">Resources</Typography>
                  <Typography color="text.secondary">Download certificates, notes, and more.</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Studentdashboars;
