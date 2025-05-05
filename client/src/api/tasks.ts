import axios from 'axios';
import { CreateTaskDto, UpdateTaskDto, Task } from '../types/task';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

const getToken = () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Пользователь не авторизован');
  return token;
};

// Добавить задачу
export const addTask = async (taskData: CreateTaskDto): Promise<Task> => {
  try {
    const response = await axios.post<Task>(
      `${API_URL}/tasks/`,
      taskData,
      { headers: { Authorization: `Bearer ${getToken()}` } }
    );
    return response.data;
  } catch (error) {
    console.error('Ошибка при добавлении задачи:', error);
    throw error;
  }
};

// Получить задачу по ID
export const getTaskById = async (taskId: string): Promise<Task> => {
  try {
    const response = await axios.get<Task>(
      `${API_URL}/tasks/${taskId}`,
      { headers: { Authorization: `Bearer ${getToken()}` } }
    );
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении задачи:', error);
    throw error;
  }
};

// Получить задачи
export const getTasks = async (): Promise<Task[]> => {
  try {
    const response = await axios.get<Task[]>(
      `${API_URL}/tasks/`,
      { headers: { Authorization: `Bearer ${getToken()}` } }
    );
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении задач:', error);
    throw error;
  }
};


// Обновить задачу
export const updateTask = async (taskId: string, taskData: UpdateTaskDto): Promise<Task> => {
  try {
    const response = await axios.put<Task>(
      `${API_URL}/tasks/${taskId}`,
      taskData,
      { headers: { Authorization: `Bearer ${getToken()}` } }
    );
    return response.data;
  } catch (error) {
    console.error('Ошибка при обновлении задачи:', error);
    throw error;
  }
};

// Удалить задачу
export const deleteTask = async (taskId: string): Promise<{ message: string }> => {
  try {
    const response = await axios.delete<{ message: string }>(
      `${API_URL}/tasks/${taskId}`,
      { headers: { Authorization: `Bearer ${getToken()}` } }
    );
    return response.data;
  } catch (error) {
    console.error('Ошибка при удалении задачи:', error);
    throw error;
  }
};
