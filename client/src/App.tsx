import React, { useState } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
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
import { AuthProvider } from './context/AuthContext';
import { CustomThemeProvider } from './context/ThemeContext';
import { NewProjectPage } from './pages/NewProjectPage';
import { Task, CreateTaskDto } from './types/task';
import { addTask } from './api/tasks';

// Обёртка для TaskForm, чтобы получить projectId из URL
const TaskFormWrapper: React.FC<{
  onSubmit: (data: FormData) => Promise<void>;
  initialData?: Partial<Task>;
  onClose: () => void;
}> = ({ onSubmit, initialData, onClose }) => {
  const { id: projectId } = useParams<{ id: string }>();

  // Если projectId нет — показываем ошибку
  if (!projectId) {
    return <div>Ошибка: проект не найден</div>;
  }

  return (
    <TaskForm
      open={true}
      onClose={onClose}
      onSubmit={onSubmit}
      initialData={initialData}
      projectId={projectId}
    />
  );
};

const App: React.FC = () => {
  const navigate = useNavigate();
  const [taskToEdit, setTaskToEdit] = useState<Partial<Task> | null>(null);

  const handleSubmitTaskForm = async (formData: FormData) => {
    const projectId = formData.get('projectId');
    if (!projectId || typeof projectId !== 'string') {
      console.error('projectId не найден или некорректен');
      return;
    }
  
    // Создать объект задачи из formData, кроме projectId — можно вручную
    const taskData: CreateTaskDto = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      type: 'marketing'
    };
  
    try {
      await addTask(projectId, taskData);
      navigate(-1);
    } catch (error) {
      console.error('Ошибка при добавлении задачи:', error);
    }
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
                <Route path="new" element={<NewProjectPage />} />
                <Route path=":id">
                  <Route index element={<ProjectDetailPage />} />
                  <Route
                    path="new-task"
                    element={
                      <TaskFormWrapper
                        onSubmit={handleSubmitTaskForm}
                        initialData={taskToEdit ?? undefined}
                        onClose={() => navigate(-1)}
                      />
                    }
                  />
                </Route>
              </Route>

              <Route path="tasks">
                <Route index element={<TasksPage />} />
                <Route path=":id" element={<TaskDetailPage />} />
              </Route>

              <Route path="calendar" element={<CalendarPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="settings" element={<SettingsPage />} />
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
