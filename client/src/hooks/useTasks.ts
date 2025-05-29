import { useEffect, useState } from 'react';
import { getTasks } from '../api/tasks';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from 'notistack';
import { Task } from '../types/task';

export const useTasks = (projectId?: string) => {
  const { token } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (!token) return;

    const fetchTasks = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getTasks(projectId, token);
        setTasks(data);
      } catch (err) {
        const errorMessage = 'Не удалось загрузить задачи';
        setError(errorMessage);
        enqueueSnackbar(errorMessage, { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();

  }, [token, projectId, enqueueSnackbar]);

  return { tasks, loading, error };
};

export default useTasks;
