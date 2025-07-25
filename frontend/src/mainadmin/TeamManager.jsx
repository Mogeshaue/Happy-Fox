import React, { useEffect, useState } from "react";
import useCourseStore from "../store/Adminstors";
import {
  Box,
  Typography,
  Card,
  Grid,
  TextField,
  Select,
  MenuItem,
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

const TeamManager = () => {
  const {
    teams,
    fetchTeams,
    addTeam,
    deleteTeam,
    loadingTeams,
    errorTeams,
    cohorts,
    fetchCohorts,
    loadingCohorts,
    errorCohorts,
  } = useCourseStore();

  const [form, setForm] = useState({ name: "", cohort: "" });
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchTeams();
    fetchCohorts();
    // eslint-disable-next-line
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name || !form.cohort) return;
    setAdding(true);
    await addTeam(form.name, form.cohort);
    setAdding(false);
    setForm({ name: "", cohort: "" });
    enqueueSnackbar('Team added', { variant: 'success' });
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    await deleteTeam(id);
    setDeletingId(null);
    enqueueSnackbar('Team removed', { variant: 'info' });
  };

  if (loadingTeams || loadingCohorts) return <Loader />;

  return (
    <Box sx={{ p: { xs: 2, md: 6 } }}>
      <Typography variant="h4" fontWeight={700} mb={4} color="text.primary">
        Team Management
      </Typography>
      <Card sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" mb={2}>Add New Team</Typography>
        <form onSubmit={handleAdd}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField
                name="name"
                label="Team Name"
                value={form.name}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <Select
                name="cohort"
                value={form.cohort}
                onChange={handleChange}
                fullWidth
                required
                displayEmpty
                disabled={loadingCohorts}
              >
                <MenuItem value=""><em>Select Cohort</em></MenuItem>
                {cohorts.map((cohort) => (
                  <MenuItem key={cohort.id} value={cohort.id}>{cohort.name}</MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                type="submit"
                variant="contained"
                color="success"
                fullWidth
                disabled={adding || loadingCohorts}
              >
                {adding ? "Adding..." : "Add Team"}
              </Button>
            </Grid>
          </Grid>
        </form>
        {errorTeams && <Typography color="error" mt={2}>{errorTeams}</Typography>}
        {errorCohorts && <Typography color="error" mt={2}>{errorCohorts}</Typography>}
      </Card>
      <Box>
        <Typography variant="h6" mb={2}>Team List</Typography>
        {errorTeams ? (
          <Typography color="error">Error: {errorTeams}</Typography>
        ) : teams.length === 0 ? (
          <Typography color="text.secondary">No teams added yet.</Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Cohort</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {teams.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell>{team.name}</TableCell>
                    <TableCell>{cohorts.find((c) => c.id === team.cohort)?.name || team.cohort}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(team.id)}
                        disabled={deletingId === team.id}
                      >
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

export default TeamManager; 