// Типы статусов задачи
export type TaskStatus = 'todo' | 'in-progress' | 'done' | 'blocked';

// Опции для выбора статуса
export const taskStatusOptions: { value: TaskStatus; label: string }[] = [
  { value: 'todo', label: 'К выполнению' },
  { value: 'in-progress', label: 'В процессе' },
  { value: 'done', label: 'Выполнено' },
  { value: 'blocked', label: 'Заблокировано' },
];

// Для быстрого доступа к меткам по значению
export const statusLabels: Record<TaskStatus, string> = {
  todo: 'К выполнению',
  'in-progress': 'В процессе',
  done: 'Выполнено',
  blocked: 'Заблокировано',
};
