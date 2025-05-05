import React, {useState} from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import Layout from './components/layout/Layout';
import DashboardPage from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { TasksPage } from './pages/TasksPage';
import TaskDetailPage from './pages/TaskDetailPage';
import CalendarPage from './pages/CalendarPage';
import NotificationsPage from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthPage } from './pages/AuthPage';
import NotFoundPage from './pages/NotFoundPage';
import TaskForm from './components/tasks/TaskForm';
import { Task } from './types/task';
import { AuthProvider } from './context/AuthContext';
import { CustomThemeProvider } from './context/ThemeContext';

const App: React.FC = () => {
  const navigate = useNavigate();
  const [isTaskFormOpen, setTaskFormOpen] = useState(false);

  const handleOpenTaskForm = () => setTaskFormOpen(true);
  const handleCloseTaskForm = () => setTaskFormOpen(false);

  const handleSubmitTaskForm = async (formData: Partial<Task>) => {
    console.log('Создана задача:', formData);
    setTaskFormOpen(false);
  };

  const handleAuthSuccess = () => {
    navigate('/');
  };

  return (
    <AuthProvider>
      <CustomThemeProvider>
        <Routes>
          {/* Публичная страница */}
          <Route path="/auth" element={<AuthPage />} />

          {/* Защищённые маршруты */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout onSuccess={handleAuthSuccess} />}>
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
              <Route
                path="projects/:id/new-task"
                element={
                  <TaskForm
                    open={isTaskFormOpen}
                    onClose={handleCloseTaskForm}
                    onSubmit={handleSubmitTaskForm}
                  />
                }
              />
            </Route>
          </Route>

          {/* Страница 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </CustomThemeProvider>
    </AuthProvider>
  );
};

export default App;
