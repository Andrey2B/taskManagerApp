import { useEffect, useState } from 'react';
import { getTasks } from '../api/tasks';
import { useAuth } from '../context/AuthContext';

const useTasks = (projectId?: string) => {
  const { token } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      if (token) {
        try {
          const data = await getTasks(token, projectId);
          setTasks(data);
        } catch (err) {
          setError('Failed to fetch tasks');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTasks();
  }, [token, projectId]);

  return { tasks, loading, error };
};

export default useTasks;