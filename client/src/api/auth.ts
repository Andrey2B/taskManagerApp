import axios from 'axios';
import {  User, RegisterData, LoginResponse } from '../types/auth';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';


// Вход
export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await axios.post<LoginResponse>(`${API_URL}/users/login`, { email, password });
  const { token, user } = response.data;

  if (!token) {
    throw new Error('Пользователь не авторизован');
  }

  // сохраняем данные в localStorage
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));

  return response.data;
};

// Регистрация
export const register = async (userData: RegisterData) => {
  const response = await axios.post(`${API_URL}/users/register`, userData);
  return response.data;
};

// Получение текущего пользователя
export const getCurrentUser = async (): Promise<User> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Пользователь не авторизован');
  }
  const response = await axios.get(`${API_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const user = response.data as User;
  return user;
};

// Выход из системы
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

//Проверка авторизации
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};
