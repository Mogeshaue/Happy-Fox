import React, { useState } from 'react';
import useCourseStore from '../store/Adminstors';
import {
  Box,
  Typography,
  Card,
  Grid,
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
import DeleteIcon from '@mui/icons-material/Delete';
import Loader from '../components/common/Loader';
import { useSnackbar } from 'notistack';

const AdminStudents = () => {
  const { students, addStudent, removeStudent } = useCourseStore();
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const handleAdd = async () => {
    if (!formData.name.trim() || !formData.email.trim()) return;
    setAdding(true);
    await addStudent(formData);
    setAdding(false);
    enqueueSnackbar('Student added successfully', { variant: 'success' });
    setFormData({ name: '', email: '' });
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    await removeStudent(id);
    setDeletingId(null);
    enqueueSnackbar('Student removed', { variant: 'info' });
  };

  if (!students) return <Loader />;

  return (
    <Box sx={{ p: { xs: 2, md: 6 } }}>
      <Typography variant="h4" fontWeight={700} mb={4} color="text.primary">
        Student Management
      </Typography>
      <Card sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" mb={2}>Add New Student</Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              label="Student Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} md={5}>
            <TextField
              label="Student Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              variant="contained"
              color="success"
              onClick={handleAdd}
              fullWidth
              disabled={adding}
            >
              {adding ? 'Adding...' : 'Add'}
            </Button>
          </Grid>
        </Grid>
      </Card>
      <Box>
        <Typography variant="h6" mb={2}>Student List</Typography>
        {students.length === 0 ? (
          <Typography color="text.secondary">No students added yet.</Typography>
        ) : (
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
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell align="right">
                      <IconButton color="error" onClick={() => handleDelete(student.id)} disabled={deletingId === student.id}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Box>
  );
};

export default AdminStudents;
