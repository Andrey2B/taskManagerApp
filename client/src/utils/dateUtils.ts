// src/utils/dateUtils.ts
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'dd MMM yyyy, HH:mm', { locale: ru });
};

export const isOverdue = (dueDate: string) => {
  return new Date(dueDate) < new Date();
};