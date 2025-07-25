import React from 'react';
import { Card, Typography, Box, Grid } from '@mui/material';

const Mycourses = () => {
  // Placeholder data
  const courses = [];

  return (
    <Box sx={{ p: { xs: 2, md: 6 } }}>
      <Typography variant="h4" fontWeight={700} mb={4} color="text.primary">
        My Courses
      </Typography>
      <Grid container spacing={3}>
        {courses.length === 0 ? (
          <Grid item xs={12}>
            <Card sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">You are not enrolled in any courses yet.</Typography>
            </Card>
          </Grid>
        ) : (
          courses.map((course) => (
            <Grid item xs={12} md={6} key={course.id}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6">{course.title}</Typography>
                <Typography color="text.secondary">{course.description}</Typography>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
};

export default Mycourses;