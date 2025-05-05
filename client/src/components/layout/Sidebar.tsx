import React from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  Toolbar, 
  ListItemButton,
  useMediaQuery,
  useTheme as useMuiTheme,
 } from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  Folder as ProjectsIcon,
  Assignment as TasksIcon,
  CalendarToday as CalendarIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon 
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from  '../../context/ThemeContext';

// Константа ширины сайдбара
const drawerWidth = 240;

const Sidebar: React.FC = () => {
  const { theme } = useTheme(); // Используем хук из ThemeContext
  const location = useLocation();

  // Адаптивный брейкпоинт MUI для мобильных экранов
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Projects', icon: <ProjectsIcon />, path: '/projects' },
    { text: 'Tasks', icon: <TasksIcon />, path: '/tasks' },
    { text: 'Calendar', icon: <CalendarIcon />, path: '/calendar' },
    { text: 'Notifications', icon: <NotificationsIcon />, path: '/notifications' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'} // временный на мобилках, постоянный на десктопах
      open={!isMobile}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: theme === 'light' ? '#fff' : '#333',
        },
      }}
    >
      <Toolbar /> {/* отступ под Header */}

      <List>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.text}
            component={Link}
            to={item.path}
            selected={location.pathname.startsWith(item.path)} // выделение по вложенным страницам
            sx={{
              '&.Mui-selected': {
                backgroundColor: theme === 'light' ? '#e0e0e0' : '#555',
              },
              '&:hover': {
                backgroundColor: theme === 'light' ? '#d0d0d0' : '#444',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>

      <Divider sx={{ my: 1 }} />

      {/* Блок для будущих дополнительных элементов или виджетов */}
      <List>
        <ListItem>
          <ListItemText
            primary="SberBox"
            secondary="Voice control enabled"
            secondaryTypographyProps={{ color: 'primary' }}
          />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;