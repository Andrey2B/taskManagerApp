// Верхняя панель

import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Avatar, 
  Box, 
  Tooltip, 
  Drawer,
  List,
  ListItem,
  ListItemText
 } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../ui/ThemeToggle';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          boxShadow: 'none',
          backgroundColor: 'background.paper',
          color: 'text.primary',
        }}
      >
        <Toolbar>
          {user && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Task Manager
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ThemeToggle />

            {user && (
              <Tooltip title="Выйти">
                <IconButton onClick={logout}>
                  <Avatar
                    src={user.avatar}
                    alt={user.name}
                    sx={{ width: 40, height: 40 }}
                  >
                    {user.name.charAt(0)}
                  </Avatar>
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 240,
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            <ListItem button onClick={handleDrawerToggle}>
              <ListItemText primary="Главная" />
            </ListItem>
            <ListItem button onClick={handleDrawerToggle}>
              <ListItemText primary="Проекты" />
            </ListItem>
            <ListItem button onClick={handleDrawerToggle}>
              <ListItemText primary="Календарь" />
            </ListItem>
            <ListItem button onClick={logout}>
              <ListItemText primary="Выйти" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Header;