import { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Stack } from '@mui/material';
import TaskCard from '../components/tasks/TaskCard';
import { Task } from '../types/task';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { token } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
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
        const response = await fetch('/tasks', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Ошибка при загрузке задач');
        }

        const data: Task[] = await response.json();
        setTasks(data);
      } catch (err: any) {
        setError(err.message || 'Не удалось загрузить задачи');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [token]);

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Мои задачи
      </Typography>

      {loading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && tasks.length === 0 && (
        <Typography>У вас пока нет задач.</Typography>
      )}

      {!loading && !error && tasks.length > 0 && (
        <Stack spacing={2} mt={2}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default DashboardPage;
