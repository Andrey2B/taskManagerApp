import axios from 'axios';
import { CreateProjectData, Project, UpdateProjectData  } from '../types/project';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Получить все проекты
export const getProjects = async (token: string) => {
  try {
    const response = await axiosInstance.get<Project[]>('/projects', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении проектов:', error);
    throw new Error('Не удалось загрузить проекты');
  };
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

//Удалить проект
export const deleteProject = async (id: string, token: string) => {
  try {
    await axiosInstance.delete(`/projects/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error('Ошибка при удалении проекта:', error);
    throw new Error('Не удалось удалить проект');
  }
};