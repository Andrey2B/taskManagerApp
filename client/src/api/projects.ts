import axios from 'axios';
import { User, RegisterData, LoginResponse } from '../types/auth';
import { CreateProjectData, Project, UpdateProjectData } from '../types/project';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Получить текущего пользователя
export const getCurrentUser = async (): Promise<User> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Пользователь не авторизован');
  }
  const response = await axios.get(`${API_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data as User;
};

// Получить все проекты
export const getProjects = async (token: string): Promise<Project[]> => {
  try {
    const response = await axiosInstance.get<Project[]>('/projects', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении проектов:', error);
    throw new Error('Не удалось загрузить проекты');
  }
};

// Создать новый проект
export const createProject = async (
  projectData: CreateProjectData,
  token: string
): Promise<Project> => {
  try {
    const response = await axiosInstance.post<Project>('/projects', projectData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Ошибка при создании проекта:', error);
    throw new Error('Не удалось создать проект');
  }
};

// Обновить существующий проект
export const updateProject = async (
  id: string,
  projectData: UpdateProjectData,
  token: string
): Promise<Project> => {
  try {
    const response = await axiosInstance.put<Project>(`/projects/${id}`, projectData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Ошибка при обновлении проекта:', error);
    throw new Error('Не удалось обновить проект');
  }
};

// Удалить проект
export const deleteProject = async (id: string, token: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/projects/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error('Ошибка при удалении проекта:', error);
    throw new Error('Не удалось удалить проект');
  }
};
