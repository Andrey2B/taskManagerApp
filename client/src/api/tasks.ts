import axios from 'axios';
import { Task, CreateTaskDto, UpdateTaskDto } from '../types/task';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const getTasks = async (token: string, projectId?: string) => {
  const url = projectId ? `${API_URL}/tasks?projectId=${projectId}` : `${API_URL}/tasks`;
  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const createTask = async (taskData: CreateTaskDto,
  token: string) => {
  const response = await axios.post(`${API_URL}/tasks`, taskData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateTask = async (id: string, taskData: any, token: string) => {
  const response = await axios.put(`${API_URL}/tasks/${id}`, taskData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteTask = async (id: string, token: string) => {
  const response = await axios.delete(`${API_URL}/tasks/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};