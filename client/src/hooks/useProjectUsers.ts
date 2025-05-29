import { useEffect, useState } from "react";
import axios from "axios";

interface User {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

export const useProjectUsers = (projectId: string) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Пользователь не авторизован');

        const response = await axios.get<User[]>(`${API_URL}/projects/${projectId}/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(response.data);
      } catch (err: any) {
        setError(err.message || 'Ошибка при загрузке пользователей');
        console.error('Ошибка при загрузке пользователей:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [projectId]);

  return { users, isLoading, error };
};
