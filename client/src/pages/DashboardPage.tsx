import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Stack } from '@mui/material';
import TaskCard from '../components/tasks/TaskCard';
import { Task } from '../types/task';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

const DashboardPage: React.FC = () => {
  const { token } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Вы не авторизованы');
      setLoading(false);
      return;
    }

    const fetchTasks = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get<Task[]>(`${API_URL}/tasks/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTasks(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Ошибка при загрузке задач');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [token]);

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Мои задачи из всех проектов
      </Typography>

      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && tasks.length === 0 && (
        <Typography>У вас пока нет задач.</Typography>
      )}

      {!loading && !error && tasks.length > 0 && (
        <Stack spacing={2} mt={2}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} readOnly />
          ))}
        </Stack>
      )}

      
    </Box>
  );
};

export default DashboardPage;