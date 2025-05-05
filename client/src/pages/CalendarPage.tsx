import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Button, Chip, useTheme } from '@mui/material';
import { DateCalendar, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, isSameDay, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Task } from '../types/task';
import { useTasks } from '../hooks/useTasks';
import TaskCalendarDay from '../components/calendar/TaskCalendarDay';
import CalendarTaskModal from '../components/calendar/CalendarTaskModal';

import 'dayjs/locale/ru';

//import { useVoice } from '../hooks/useVoice';
//import VoiceButton from '../components/ui/VoiceButton';

const CalendarPage: React.FC = () => {
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const { tasks, loading, error } = useTasks();
  //const { voiceCommand, startVoice } = useVoice();

  // Фильтрация задач для выбранной даты
  useEffect(() => {
    if (tasks && selectedDate) {
      const filtered = tasks.filter(task => 
        task.dueDate && isSameDay(parseISO(task.dueDate), selectedDate)
      );
      setSelectedTasks(filtered);
    }
  }, [tasks, selectedDate]);

  // Обработка голосовых команд
  useEffect(() => {
    /*if (!voiceCommand) return;*/

    /*if (voiceCommand.includes('открыть')) {
      const dateMatch = voiceCommand.match(/\d{1,2}\s?(января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)/i);
      if (dateMatch) {
        const [day, month] = dateMatch[0].split(' ');
        const monthIndex = ru.localize.monthParse(month.toLowerCase())!;
        const newDate = new Date(new Date().getFullYear(), monthIndex, parseInt(day));
        setSelectedDate(newDate);
      }
    } else if (voiceCommand.includes('создать задачу')) {
      setOpenModal(true);
    }*/
  }/*, [voiceCommand]*/);

  const handleDateChange = (date: Date | null) => {
    if (date) setSelectedDate(date);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedTask(null);
  };

  const getTasksForDay = (date: Date) => {
    return tasks?.filter(task => 
      task.dueDate && isSameDay(parseISO(task.dueDate), date)
    ).length || 0;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3
      }}>
        <Typography variant="h4" component="h1">
          Календарь задач
        </Typography>
        {/*<VoiceButton onClick={startVoice} />*/}
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          Ошибка загрузки задач: {error}
        </Typography>
      )}

      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        gap: 3
      }}>
        {/* Календарь */}
        <Box sx={{ 
          flex: 1,
          maxWidth: { md: 400 },
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          p: 2,
          bgcolor: 'background.paper'
        }}>
          <LocalizationProvider
            dateAdapter={AdapterDateFns}
            //adapterLocale={ru}
          >
            <DateCalendar
              value={selectedDate}
              onChange={handleDateChange}
              views={['day', 'month']}
              dayOfWeekFormatter={(day: Date) => format(day, 'EEEEE', { locale: ru }).toUpperCase()}
              slots={{
                day: (props) => (
                  <TaskCalendarDay 
                    {...props} 
                    tasksCount={getTasksForDay(props.day)} 
                  />
                ),
              }}
            />
          </LocalizationProvider>
        </Box>

        {/* Список задач на выбранную дату */}
        <Box sx={{ 
          flex: 2,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          p: 3,
          bgcolor: 'background.paper'
        }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Задачи на {format(selectedDate, 'd MMMM yyyy', { locale: ru })}
          </Typography>

          {loading ? (
            <CircularProgress />
          ) : selectedTasks.length === 0 ? (
            <Typography variant="body1" color="text.secondary">
              Нет задач на выбранную дату
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {selectedTasks.map((task) => (
                <Box
                  key={task.id}
                  onClick={() => handleTaskClick(task)}
                  sx={{
                    p: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: theme.palette.action.hover
                    }
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Typography variant="subtitle1">{task.title}</Typography>
                    <Chip 
                      label={task.priority} 
                      size="small"
                      color={
                        task.priority === 'high' ? 'error' : 
                        task.priority === 'medium' ? 'warning' : 'success'
                      }
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {task.projectId && `Проект: ${task.projectId}`}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}

          <Button 
            variant="contained" 
            sx={{ mt: 2 }}
            onClick={() => setOpenModal(true)}
          >
            Добавить задачу
          </Button>
        </Box>
      </Box>

      {/* Модальное окно для создания/просмотра задачи */}
      <CalendarTaskModal
        open={openModal}
        onClose={handleCloseModal}
        date={selectedDate}
        task={selectedTask}
      />
    </Box>
  );
};

export default CalendarPage;