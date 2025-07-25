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

const InvitationManager = () => {
  const {
    invitations,
    fetchInvitations,
    addInvitation,
    deleteInvitation,
    loadingInvitations,
    errorInvitations,
    teams,
    fetchTeams,
    loadingTeams,
    errorTeams,
  } = useCourseStore();

  const [form, setForm] = useState({ email: "", team: "" });
  const [inviting, setInviting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchInvitations();
    fetchTeams();
    // eslint-disable-next-line
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!form.email || !form.team) return;
    setInviting(true);
    await addInvitation(form.email, form.team);
    setInviting(false);
    setForm({ email: "", team: "" });
    enqueueSnackbar('Invitation sent', { variant: 'success' });
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    await deleteInvitation(id);
    setDeletingId(null);
    enqueueSnackbar('Invitation revoked', { variant: 'info' });
  };

  if (loadingInvitations || loadingTeams) return <Loader />;

  return (
    <Box sx={{ p: { xs: 2, md: 6 } }}>
      <Typography variant="h4" fontWeight={700} mb={4} color="text.primary">
        Invitation Management
      </Typography>
      <Card sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" mb={2}>Invite Member to Team</Typography>
        <form onSubmit={handleInvite}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField
                type="email"
                name="email"
                label="Member Email"
                value={form.email}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <Select
                name="team"
                value={form.team}
                onChange={handleChange}
                fullWidth
                required
                displayEmpty
                disabled={loadingTeams}
              >
                <MenuItem value=""><em>Select Team</em></MenuItem>
                {teams.map((team) => (
                  <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                type="submit"
                variant="contained"
                color="success"
                fullWidth
                disabled={inviting || loadingTeams}
              >
                {inviting ? "Inviting..." : "Invite"}
              </Button>
            </Grid>
          </Grid>
        </form>
        {errorInvitations && <Typography color="error" mt={2}>{errorInvitations}</Typography>}
        {errorTeams && <Typography color="error" mt={2}>{errorTeams}</Typography>}
      </Card>
      <Box>
        <Typography variant="h6" mb={2}>Invitations</Typography>
        {errorInvitations ? (
          <Typography color="error">Error: {errorInvitations}</Typography>
        ) : invitations.length === 0 ? (
          <Typography color="text.secondary">No invitations sent yet.</Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Email</TableCell>
                  <TableCell>Team</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invitations.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell>{inv.email}</TableCell>
                    <TableCell>{teams.find((t) => t.id === inv.team)?.name || inv.team}</TableCell>
                    <TableCell>{inv.accepted ? "Accepted" : "Pending"}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(inv.id)}
                        disabled={deletingId === inv.id}
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

export default InvitationManager; 