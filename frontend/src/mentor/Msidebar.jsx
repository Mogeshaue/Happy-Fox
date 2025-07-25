import React from 'react';
import { NavLink } from 'react-router-dom';
import { List, ListItem, ListItemIcon, ListItemText, Box, Typography, Divider } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ListAltIcon from '@mui/icons-material/ListAlt';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import SchoolIcon from '@mui/icons-material/School';

const navItems = [
  { to: 'dashboard', text: 'Dashboard', icon: <DashboardIcon /> },
  { to: 'addcourse', text: 'Assigned-Courses', icon: <MenuBookIcon /> },
  { to: 'create-course', text: 'Created Courses', icon: <ListAltIcon /> },
  { to: 'Add-students', text: 'Add Students', icon: <GroupAddIcon /> },
  { to: 'Add-mentors', text: 'Add Mentors', icon: <SchoolIcon /> },
];

const Msidebar = () => {
  return (
    <Box sx={{ width: 220, height: '100vh', bgcolor: 'background.paper', borderRight: 1, borderColor: 'divider', p: 2 }}>
      <Typography variant="h5" fontWeight={700} color="text.primary" mb={4}>
        Mentor Panel
      </Typography>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem
            button
            key={item.text}
            component={NavLink}
            to={item.to}
            sx={{
              borderRadius: 2,
              mb: 1,
              '&.active': {
                bgcolor: 'primary.main',
                color: 'white',
                fontWeight: 600,
                '& .MuiListItemIcon-root': { color: 'white' },
              },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Msidebar;
