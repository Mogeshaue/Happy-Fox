import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import SchoolIcon from '@mui/icons-material/School';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import Loader from '../components/common/Loader';
import useMentorDashboardData from '../hooks/useMentorDashboardData';
import { useSnackbar } from 'notistack';

const AdminMentor = () => {
  const { stats, mentors, loading, error } = useMentorDashboardData();
  const { enqueueSnackbar } = useSnackbar();
  const [mentorData, setMentorData] = useState({ name: '', email: '' });

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error, { variant: 'error' });
    }
  }, [error, enqueueSnackbar]);

  const handleChange = (e) => {
    setMentorData({ ...mentorData, [e.target.name]: e.target.value });
  };

  const handleAddMentor = () => {
    if (mentorData.name.trim() && mentorData.email.trim()) {
      // TODO: Replace with real API call
      enqueueSnackbar('Mentor added successfully', { variant: 'success' });
      setMentorData({ name: '', email: '' });
    }
  };

  const handleDeleteMentor = (id) => {
    // TODO: Replace with real API call
    enqueueSnackbar('Mentor deleted', { variant: 'info' });
  };

  if (loading) return <Loader />;

  return (
    <Box sx={{ p: { xs: 2, md: 6 } }}>
      <Typography variant="h4" fontWeight={700} mb={4} color="text.primary">
        Mentor Dashboard
      </Typography>
      <Grid container spacing={3} mb={4}>
        {stats ? (
          <>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <GroupIcon color="primary" sx={{ fontSize: 40 }} />
                    <Box ml={2}>
                      <Typography variant="h6">{stats.total_mentors}</Typography>
                      <Typography color="text.secondary">Total Mentors</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <SchoolIcon color="secondary" sx={{ fontSize: 40 }} />
                    <Box ml={2}>
                      <Typography variant="h6">{stats.active_courses}</Typography>
                      <Typography color="text.secondary">Active Courses</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <PersonAddIcon color="success" sx={{ fontSize: 40 }} />
                    <Box ml={2}>
                      <Typography variant="h6">{stats.students_assigned}</Typography>
                      <Typography color="text.secondary">Students Assigned</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </>
        ) : null}
      </Grid>
      <Box mb={4}>
        <Typography variant="h6" mb={2}>
          Add Mentor
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              label="Mentor Name"
              name="name"
              value={mentorData.name}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Mentor Email"
              name="email"
              value={mentorData.email}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              variant="contained"
              color="success"
              onClick={handleAddMentor}
              startIcon={<PersonAddIcon />}
              fullWidth
            >
              Add Mentor
            </Button>
          </Grid>
        </Grid>
      </Box>
      <Box>
        <Typography variant="h6" mb={2}>
          Mentor List
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mentors && mentors.length > 0 ? (
                mentors.map((mentor) => (
                  <TableRow key={mentor.id || mentor.email}>
                    <TableCell>{mentor.name}</TableCell>
                    <TableCell>{mentor.email}</TableCell>
                    <TableCell align="right">
                      <IconButton color="error" onClick={() => handleDeleteMentor(mentor.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No mentors found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default AdminMentor;
