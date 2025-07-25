import React, { useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group';
import SchoolIcon from '@mui/icons-material/School';
import Loader from '../components/common/Loader';
import useAdminDashboardData from '../hooks/useAdminDashboardData';
import { useSnackbar } from 'notistack';

const drawerWidth = 220;

const navItems = [
  { text: 'Dashboard', icon: <DashboardIcon /> },
  { text: 'Students', icon: <SchoolIcon /> },
  { text: 'Cohorts', icon: <GroupIcon /> },
];

const AdminDashboard = () => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { stats, students, loading, error } = useAdminDashboardData();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error, { variant: 'error' });
    }
  }, [error, enqueueSnackbar]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box sx={{ width: drawerWidth }}>
      <Toolbar>
        <Typography variant="h6" noWrap>
          Admin Panel
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem button key={item.text}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  if (loading) return <Loader />;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: 'background.default' }}>
      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="admin navigation"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              Admin Dashboard
            </Typography>
          </Toolbar>
        </AppBar>
        <Toolbar />
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {stats ? (
            <>
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center">
                      <SchoolIcon color="primary" />
                      <Box ml={2}>
                        <Typography variant="h6">{stats.total_students}</Typography>
                        <Typography color="textSecondary">Total Students</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center">
                      <GroupIcon color="secondary" />
                      <Box ml={2}>
                        <Typography variant="h6">{stats.active_cohorts}</Typography>
                        <Typography color="textSecondary">Active Cohorts</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center">
                      <DashboardIcon color="action" />
                      <Box ml={2}>
                        <Typography variant="h6">{stats.mentors}</Typography>
                        <Typography color="textSecondary">Mentors</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </>
          ) : null}
        </Grid>
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            Recent Students
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Cohort</TableCell>
                  <TableCell>Progress</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students && students.length > 0 ? (
                  students.map((row) => (
                    <TableRow key={row.id || row.name}>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.cohort}</TableCell>
                      <TableCell>{row.progress}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      No recent students found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
