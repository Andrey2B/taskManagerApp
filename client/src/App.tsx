import React from 'react';
import logo from './logo.svg';
import './App.css';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
//import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
//import { VoiceProvider } from './context/VoiceContext';
//import theme from './theme';
import { CustomThemeProvider } from './context/ThemeContext';
import Layout from './components/layout/Layout';
import { createTheme } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import { VoiceProvider } from './context/VoiceContext';
import { AuthPage } from './pages/AuthPage';
import { ProtectedRoute } from './components/ProtectedRoute';

import DashboardPage from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { TasksPage } from './pages/TasksPage';
import { TaskDetailPage } from './pages/TaskDetailPage';
import  CalendarPage from './pages/CalendarPage';
import  NotificationsPage from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';

// Создаем тему приложения
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    error: {
      main: '#f44336',
    },
    success: {
      main: '#4caf50',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider>
        <AuthProvider>
          <VoiceProvider>
            <Router>
              <Routes>
                {/* Public routes */}
                <Route path="/auth" element={<AuthPage />} />

                {/* Protected routes */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<Layout />}>
                    <Route index element={<DashboardPage />} />
                    <Route path="projects">
                      <Route index element={<ProjectsPage />} />
                      <Route path=":id" element={<ProjectDetailPage />} />
                    </Route>
                    <Route path="tasks">
                      <Route index element={<TasksPage />} />
                      <Route path=":id" element={<TaskDetailPage />} />
                    </Route>
                    <Route path="calendar" element={<CalendarPage />} />
                    <Route path="notifications" element={<NotificationsPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="notifications" element={<NotificationsPage />} />
                    <Route path="tasks/:id" element={<TaskDetailPage />} />
                    <Route path="projects/:id" element={<ProjectDetailPage />} />
                    <Route path="projects/:id/new-task" element={<TaskForm />} />
                  </Route>
                </Route>

                {/* 404 Not Found */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Router>
          </VoiceProvider>
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}


export default App;
