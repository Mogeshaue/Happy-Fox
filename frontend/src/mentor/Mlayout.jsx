import React, { useState } from 'react';
import { Box, Drawer, AppBar, Toolbar, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Msidebar from './Msidebar';
import Mnavbar from './Mnavbar';

const drawerWidth = 220;

const Mlayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: 'background.default' }}>
      {/* Sidebar */}
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }} aria-label="mentor navigation">
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
          <Msidebar />
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          <Msidebar />
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
            <Mnavbar />
          </Toolbar>
        </AppBar>
        <Toolbar />
        <Box sx={{ mt: 2 }}>
          {/* Routed page content */}
          <React.Suspense fallback={null}>
            {/* Use Outlet if using react-router-dom v6+ */}
            {/* <Outlet /> */}
          </React.Suspense>
        </Box>
      </Box>
    </Box>
  );
};

export default Mlayout;
