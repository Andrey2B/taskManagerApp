import { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import TaskCard from '../components/tasks/TaskCard';
import { Task } from '../types/task';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { user, token } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        if (!token) {
          setError('Вы не авторизованы');
          setLoading(false);
          return;
        }

        const response = await fetch('/api/tasks', {
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
    <Box>
      <Typography variant="h4" gutterBottom>
        Мои задачи
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : tasks.length === 0 ? (
        <Typography>У вас пока нет задач.</Typography>
      ) : (
        tasks.map((task) => <TaskCard key={task.id} task={task} />)
      )}
    </Box>
  );
};

export default DashboardPage;
