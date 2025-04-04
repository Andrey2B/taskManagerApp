import { User } from './auth';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  members: ProjectMember[];
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus = 'active' | 'archived' | 'completed';

export interface ProjectMember {
  user: User | string; // string - когда приходит только ID
  role: ProjectRole;
}

export type ProjectRole = 'owner' | 'editor' | 'viewer';

export interface CreateProjectDto {
  name: string;
  description: string;
}

export interface UpdateProjectDto extends Partial<CreateProjectDto> {
  status?: ProjectStatus;
}