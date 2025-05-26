import { User } from './auth';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  members: ProjectMember[];
  createdAt: string;
  updatedAt?: string;
  createdBy: string;
}

export type ProjectStatus =
  | 'planning'     // Планируется
  | 'active'       // В работе
  | 'on-hold'      // Приостановлен
  | 'completed'    // Завершён
  | 'archived'     // Архив
  | 'cancelled';   // Отменён

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
  status: ProjectStatus;
  role: ProjectRole;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  deadline?: string;
}

export type ProjectStatus = 'active' | 'archived' | 'completed';

export interface ProjectMember {
  id: string;
  user: User | string;
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