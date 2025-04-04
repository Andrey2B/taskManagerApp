import { User } from './auth';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  projectId: string;
  assignedTo?: User | string; // string - когда приходит только ID
  createdBy: User | string;
  comments: TaskComment[];
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'todo' | 'in-progress' | 'done' | 'blocked';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface TaskComment {
  id: string;
  text: string;
  author: User;
  createdAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'document' | 'other';
  size: number;
  uploadedAt: string;
}

export interface CreateTaskDto {
  title: string;
  description: string;
  projectId: string;
  assignedTo?: string;
  dueDate?: string;
  priority?: TaskPriority;
}

export interface UpdateTaskDto extends Partial<CreateTaskDto> {
  status?: TaskStatus;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  projectId?: string;
  assignedTo?: string;
  overdueOnly?: boolean;
}