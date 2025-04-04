import { format, parseISO } from 'date-fns';

export const formatDate = (dateString: string) => {
  return format(parseISO(dateString), 'PPpp');
};

export const formatDateShort = (dateString: string) => {
  return format(parseISO(dateString), 'PP');
};