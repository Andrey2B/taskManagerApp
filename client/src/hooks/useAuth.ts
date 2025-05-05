import { useState } from 'react';
import { login, register, getCurrentUser } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import { LoginResponse, User, UserRole } from '../types/auth';
import { ProjectRole } from '../types/project';


// Хук для работы с аутентификацией
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const isAuthenticated = !!token;

  // Вход пользователя
  const handleLogin = async (email: string, password: string, projectId: string) => {
    setLoading(true);
    try {
      const response = await login(email, password) as LoginResponse;
      setToken(response.token);
      localStorage.setItem('token', response.token);
      setUser(response.user);

      // Сохраняем информацию о проекте и роли
      localStorage.setItem('projectId', projectId);
      localStorage.setItem('role', '');

      navigate(`/project/${projectId}`);
    } catch (err) {
      setError('Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  // Регистрация пользователя
  const handleRegister = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const response = await register({ name, email, password }) as LoginResponse;
      setToken(response.token);
      localStorage.setItem('token', response.token);
      setUser(response.user);
      navigate('/projects');
    } catch (err) {
      setError('Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  // Получение текущего пользователя
  const fetchCurrentUser = async () => {
    if (token) {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (err) {
        setError('Ошибка получения данных пользователя');
      }
    }
  };

  // Выход пользователя
  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('projectId');
    localStorage.removeItem('role');
    navigate('/login'); // ← здесь все правильно
  };

  // Установка роли пользователя в проекте
  const setProjectRole = (role: string) => {
    localStorage.setItem('role', role);
    setUser((prevUser) => {
      if (!prevUser) return null;
      return { ...prevUser, role: role as ProjectRole }; // Обновляем роль в объекте user
    });
  };

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    handleLogin,
    handleRegister,
    fetchCurrentUser,
    handleLogout,
    setProjectRole,
  };
};
