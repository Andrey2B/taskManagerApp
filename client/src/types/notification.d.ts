import { Task } from './task';
import { Project } from './project';

export interface Notification {
  id: string;
  type: NotificationType;
  read: boolean;
  data: NotificationData;
  createdAt: string;
  userId?: string; // Для персонализации
}

export type NotificationType = 
  | 'task_assigned' 
  | 'task_status_changed'
  | 'new_comment'
  | 'project_invite';

export type NotificationData = {
  task?: Task;
  project?: Project;
  comment?: string;
  changedBy?: string;
};