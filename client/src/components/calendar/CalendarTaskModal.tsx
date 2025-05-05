import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Chip, Box } from '@mui/material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Task } from '../../types/task';
import TaskForm from '../tasks/TaskForm';
import { getPriorityColor } from '../../utils/getPriorityColor';

interface CalendarTaskModalProps {
  open: boolean;
  onClose: () => void;
  date: Date;
  task?: Task | null;
}

const CalendarTaskModal: React.FC<CalendarTaskModalProps> = ({ open, onClose, date, task }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      {task ? (
        <>
          <DialogTitle>Задача: {task.title}</DialogTitle>
          <DialogContent dividers>
            <Typography variant="body1" gutterBottom>
              {task.description}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Chip label={`Статус: ${task.status}`} />
              <Chip 
                label={`Приоритет: ${task.priority}`} 
                color={getPriorityColor(task.priority)} 
              />
              <Chip 
                label={`Срок: ${
                  task.dueDate && !isNaN(new Date(task.dueDate).getTime())
                    ? format(new Date(task.dueDate), 'd MMMM yyyy', { locale: ru })
                    : 'Дата не установлена'
                }`} 
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Закрыть</Button>
          </DialogActions>
        </>
      ) : (
        <TaskForm
          open={open}
          onClose={onClose}
          onSubmit={async (taskData) => {
            console.log('Создать задачу:', taskData);
            // Если нужно выполнить асинхронные действия, например, отправить запрос на сервер:
            // await yourAsyncFunction(taskData);
            onClose();
          }}
          initialData={{ dueDate: date.toISOString() }}
        />
      )}
    </Dialog>
  );
};

export default CalendarTaskModal;