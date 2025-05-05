import { useEffect, useState } from 'react';
import { getTasks } from '../api/tasks';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from 'notistack';

export const useTasks = (projectId?: string) => {
  const { token } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchTasks = async () => {
      if (token) {
        try {
          const data = await getTasks();
          setTasks(data);
        } catch (err) {
          const errorMessage = 'Не удалось загрузить задачи';
          setError(errorMessage);
          enqueueSnackbar(errorMessage, { variant: 'error' });
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTasks();
  }, [token, projectId, enqueueSnackbar]);

  return { tasks, loading, error };
};

export default useTasks;