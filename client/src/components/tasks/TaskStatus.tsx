// Типы статусов задачи
export type TaskStatus = 'todo' | 'in-progress' | 'done' | 'blocked';

// Опции для выбора статуса
export const taskStatusOptions: { value: TaskStatus; label: string }[] = [
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
  { value: 'blocked', label: 'Blocked' },
];