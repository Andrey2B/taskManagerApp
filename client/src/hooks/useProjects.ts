// hooks/useProjects.ts
import { useState } from 'react';
import { 
  getProjects, 
  createProject, 
  updateProject, 
  deleteProject 
} from '../api/projects';
import { User } from '../types/auth';
import { Project } from '../types/project';
 


interface ApiError {
  message: string;
  status?: number;
}

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);

  // Метод для получения проекта по ID
  const getProjectById = (projectId: string): Project | undefined => {
    return projects.find((project) => project.id === projectId);
  };

  // Получение списка проектов
  const fetchProjects = async (token: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getProjects(token);
      setProjects(response as Project[]);;
    } catch (err) {
      handleError(err, 'Ошибка при получении проектов');
    } finally {
      setIsLoading(false);
    }
  };

  // Добавление нового проекта
  const addProject = async (
    projectData: Omit<Project, 'id'>, 
    token: string
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newProject = await createProject(projectData, token) as Project;
      setProjects(prev => [...prev, newProject]);
    } catch (err) {
      handleError(err, 'Ошибка при создании проекта');
    } finally {
      setIsLoading(false);
    }
  };

  // Редактирование проекта
  const editProject = async (
    id: string, 
    projectData: Partial<Project>, 
    token: string
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedProject = await updateProject(id, projectData, token) as Project;
      setProjects(prev => 
        prev.map(project => 
          project.id === id ? updatedProject : project
        )
      );
    } catch (err) {
      handleError(err, 'Ошибка при обновлении проекта');
    } finally {
      setIsLoading(false);
    }
  };

  // Удаление проекта
  const removeProject = async (
    id: string, 
    token: string
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await deleteProject(id, token);
      setProjects(prev => prev.filter(project => project.id !== id));
    } catch (err) {
      handleError(err, 'Ошибка при удалении проекта');
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчик ошибок
  const handleError = (err: unknown, defaultMessage: string): void => {
    if (err && typeof err === 'object' && 'message' in err) {
      setError({
        message: String((err as { message?: unknown }).message || defaultMessage),
      });
    } else {
      setError({ message: defaultMessage });
    }
  };

  return {
    projects,
    isLoading,
    error,
    fetchProjects,
    addProject,
    editProject,
    removeProject,
    getProjectById,
  };
};