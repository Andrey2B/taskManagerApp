import { User } from './auth';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  members: ProjectMember[]; // Список пользователей и их ролей в проекте
  createdAt: string;
  updatedAt?: string;
  createdBy: string;
}

interface ProjectUser {
  userId: string;
  role: UserRole;
}

export type ProjectRole = 
  | 'owner'   
  | 'developer' 
  | 'designer'  
  | 'manager'   
  | 'qa'         
  | 'analyst';  

export interface CreateProjectData {
  name: string;
  description?: string;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  deadline?: string;
}

export type ProjectStatus = 'active' | 'archived' | 'completed';

export interface ProjectMember {
  id: string;  // Убедитесь, что это поле есть
  user: User | string; // string - когда приходит только ID
  role: ProjectRole;
  name?: string;
}

export type ProjectRole = 'owner' | 'editor' | 'viewer';

export interface CreateProjectDto {
  name: string;
  description: string;
}

export interface UpdateProjectDto extends Partial<CreateProjectDto> {
  status?: ProjectStatus;
}