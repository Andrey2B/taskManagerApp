// src/pages/TasksPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import WarningIcon from '@mui/icons-material/Warning';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Chip,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  CircularProgress,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
  Badge,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Task as TaskIcon,
  ArrowForward as ArrowIcon,
  MoreVert as MoreIcon,
  CheckCircle as DoneIcon,
  PlayCircleOutline as InProgressIcon,
  RadioButtonUnchecked as TodoIcon,
  Block as BlockedIcon,
  Comment as CommentIcon,
  AttachFile as AttachmentIcon,
  Warning as CriticalIcon,
  Error as HighIcon,
  Info as MediumIcon,
  LowPriority as LowIcon,
  Sort as SortIcon
} from '@mui/icons-material';
import { Task, TaskStatus, TaskPriority, TaskFilters, TaskWithUser } from '../types/task';
import { useSnackbar } from 'notistack';
import { formatDate, isOverdue } from '../utils/dateUtils';
import { User } from '../types/auth';

// Константы для отображения
const STATUS_CONFIG = {
  'todo': { icon: <TodoIcon />, label: 'К выполнению', color: 'default' },
  'in-progress': { icon: <InProgressIcon />, label: 'В работе', color: 'primary' },
  'done': { icon: <DoneIcon />, label: 'Завершено', color: 'success' },
  'blocked': { icon: <BlockedIcon />, label: 'Заблокировано', color: 'error' }
} as const;

const PRIORITY_CONFIG = {
  'critical': { icon: <CriticalIcon />, label: 'Критическая', color: 'error' as const },
  'high': { icon: <HighIcon />, label: 'Высокая', color: 'warning' as const },
  'medium': { icon: <MediumIcon />, label: 'Средняя', color: 'info' as const },
  'low': { icon: <LowIcon />, label: 'Низкая', color: 'success' as const }
} as const;

export const TasksPage = () => {
  const [tasks, setTasks] = useState<TaskWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TaskFilters>({
    status: undefined,
    priority: undefined,
    overdueOnly: false
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority'>('dueDate');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // Загрузка задач (замените на реальный API)
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // Запрос к API для получения задач
        const response = await fetch('http://127.0.0.1:8000/api/tasks'); 
        if (!response.ok) {
          throw new Error('Не удалось загрузить задачи');
        }
        
        const tasks: Task[] = await response.json(); // Преобразование ответа в массив задач
        const tasksWithUsers = await enrichTasksWithUsers(tasks); // Обогащаем задачи данными пользователей
        setTasks(tasksWithUsers);
        setLoading(false); // Завершаем загрузку
      } catch (error) {
        enqueueSnackbar('Ошибка загрузки задач', { variant: 'error' }); // Показываем ошибку пользователю
        setLoading(false); // Завершаем загрузку
      }
    };

    fetchTasks();
  }, [enqueueSnackbar]);

  // Обогащение задач данными пользователей
  const enrichTasksWithUsers = async (tasks: Task[]): Promise<TaskWithUser[]> => {
    return Promise.all(tasks.map(async task => ({
      ...task,
      assignedTo: task.assignedTo ? await fetchUser(task.assignedTo) : undefined,
      createdBy: await fetchUser(task.createdBy)
    })));
  };

  // Загрузка пользователя c API
  const fetchUser = async (user: User | string): Promise<User> => {
  if (typeof user !== 'string') return user;

  try {
    const response = await fetch(`http://127.0.0.1:8000/api/users/${user}`);
    if (!response.ok) {
      throw new Error('Ошибка загрузки пользователя');
    }

    const userData = await response.json();

    // Предполагается, что API возвращает объект, который можно напрямую использовать в качестве User
    return {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      avatar: userData.avatar,
      role: userData.role,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
      token: userData.token
    };
  } catch (error) {
    console.error(error);
    throw new Error('Ошибка загрузки данных пользователя');
  }
};


  // Фильтрация и сортировка
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Фильтр по статусу
      if (filters.status && task.status !== filters.status) return false;
      
      // Фильтр по приоритету
      if (filters.priority && task.priority !== filters.priority) return false;
      
      // Фильтр по просроченным
      if (filters.overdueOnly && (!task.dueDate || !isOverdue(task.dueDate))) {
        return false;
      }
      
      // Поиск
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query) ||
          task.assignedTo?.name.toLowerCase().includes(query) ||
          task.createdBy.name.toLowerCase().includes(query)
        );
      }
      
      return true;
    }).sort((a, b) => {
      if (sortBy === 'dueDate') {
        // Сортировка по сроку
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        return dateA - dateB;
      
      }

      if (sortBy === 'priority') {
        // Сортировка по приоритету (critical > high > medium > low)
        const priorityOrder = ['critical', 'high', 'medium', 'low'];
        return priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority);
      }

      if (sortBy === 'createdAt') {
        // Сортировка по дате создания задачи, если указано
        const createdAtA = new Date(a.createdAt || 0).getTime();
        const createdAtB = new Date(b.createdAt || 0).getTime();
        return createdAtA - createdAtB;
      }

      return 0; // Если сортировка не задана, не меняем порядок
    });
  }, [tasks, filters, searchQuery, sortBy]);

  // Обработчики UI
  const handleStatusChange = (newStatus: TaskStatus) => {
    if (!selectedTask) return;
    
    // Обновление статуса задачи
    setTasks(tasks.map(task => 
      task.id === selectedTask ? { 
        ...task, 
        status: newStatus,
        updatedAt: new Date().toISOString() 
      } : task
    ));

    // Уведомление о обноалении статуса
    enqueueSnackbar(`Статус изменен на "${STATUS_CONFIG[newStatus].label}"`, { variant: 'success' });
    setAnchorEl(null);
  };

  // Обработчик выбора задачи для изменения статуса
    const handleTaskSelect = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTask(task.id);
      setAnchorEl(null); // Закрыть меню, если оно открыто
    }
  };

  // Обработчик фильтрации задач по сроку
  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const handleDeleteTask = () => {
    if (!selectedTask) return;
    
    setTasks(tasks.filter(task => task.id !== selectedTask));
    enqueueSnackbar('Задача удалена', { variant: 'success' });
    setAnchorEl(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Заголовок и кнопка создания */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Задачи
          <Badge 
            badgeContent={tasks.filter(t => !t.assignedTo).length} 
            color="error" 
            sx={{ ml: 2 }}
          >
            <Typography variant="caption">Не назначено</Typography>
          </Badge>
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/tasks/new')}
        >
          Новая задача
        </Button>
      </Box>

      {/* Панель фильтров */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Поиск по задачам..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flex: 2 }}
          />

          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Статус</InputLabel>
            <Select
              value={filters.status || ''}
              onChange={(e) => setFilters({...filters, status: e.target.value as TaskStatus || undefined})}
              label="Статус"
            >
              <MenuItem value="">Все</MenuItem>
              {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                <MenuItem key={key} value={key}>{label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Приоритет</InputLabel>
            <Select
              value={filters.priority || ''}
              onChange={(e) => setFilters({...filters, priority: e.target.value as TaskPriority || undefined})}
              label="Приоритет"
            >
              <MenuItem value="">Все</MenuItem>
              {Object.entries(PRIORITY_CONFIG).map(([key, { label }]) => (
                <MenuItem key={key} value={key}>{label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant={filters.overdueOnly ? "contained" : "outlined"}
            color="error"
            onClick={() => setFilters({...filters, overdueOnly: !filters.overdueOnly})}
            startIcon={<WarningIcon />}
          >
            Просроченные
          </Button>

          <Button
            variant="outlined"
            startIcon={<SortIcon />}
            onClick={() => setSortBy(sortBy === 'dueDate' ? 'priority' : 'dueDate')}
          >
            Сортировка: {sortBy === 'dueDate' ? 'По сроку' : 'По приоритету'}
          </Button>
        </Box>
      </Paper>

      {/* Список задач */}
      {filteredTasks.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <TaskIcon sx={{ fontSize: 64, opacity: 0.3, mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Задачи не найдены
          </Typography>
          <Button
            variant="outlined"
            sx={{ mt: 2 }}
            onClick={() => {
              setSearchQuery('');
              setFilters({});
            }}
          >
            Сбросить фильтры
          </Button>
        </Paper>
      ) : (
        <List sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
          {filteredTasks.map((task) => (
            <React.Fragment key={task.id}>
              <ListItem
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="Действия"
                    onClick={(e) => {
                      setSelectedTask(task.id);
                      setAnchorEl(e.currentTarget);
                    }}
                  >
                    <MoreIcon />
                  </IconButton>
                }
                sx={{
                  opacity: task.status === 'done' ? 0.8 : 1,
                  bgcolor: task.status === 'done' ? 'action.hover' : 'background.paper'
                }}
              >
                <ListItemAvatar>
                  <Tooltip title={STATUS_CONFIG[task.status].label}>
                    <Avatar sx={{ 
                      bgcolor: `${STATUS_CONFIG[task.status].color}.light`,
                      color: `${STATUS_CONFIG[task.status].color}.contrastText`
                    }}>
                      {STATUS_CONFIG[task.status].icon}
                    </Avatar>
                  </Tooltip>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" flexWrap="wrap" gap={1}>
                      <Typography
                        component="span"
                        variant="subtitle1"
                        sx={{ 
                          fontWeight: task.status === 'done' ? 'normal' : 'bold',
                          textDecoration: task.status === 'done' ? 'line-through' : 'none'
                        }}
                      >
                        {task.title}
                      </Typography>
                      
                      <Tooltip title={PRIORITY_CONFIG[task.priority].label}>
                        <Chip
                          icon={PRIORITY_CONFIG[task.priority].icon}
                          label={PRIORITY_CONFIG[task.priority].label}
                          size="small"
                          color={PRIORITY_CONFIG[task.priority].color}
                          variant="outlined"
                        />
                      </Tooltip>
                      
                      {task.dueDate && isOverdue(task.dueDate) && task.status !== 'done' && (
                        <Chip
                          label={`Просрочено: ${formatDate(task.dueDate)}`}
                          color="error"
                          size="small"
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary">
                        {task.description}
                      </Typography>
                      
                      <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                        {task.assignedTo && (
                          <Tooltip title={`Исполнитель: ${task.assignedTo.name}`}>
                            <Chip
                              avatar={<Avatar src={task.assignedTo.avatar}>{task.assignedTo.name[0]}</Avatar>}
                              label={task.assignedTo.name}
                              size="small"
                              variant="outlined"
                            />
                          </Tooltip>
                        )}
                        
                        <Chip
                          icon={<CommentIcon />}
                          label={(task.comments ?? []).length}
                          size="small"
                        />
                        
                        <Chip
                          icon={<AttachmentIcon />}
                          label={(task.attachments ?? []).length}
                          size="small"
                        />
                        
                        <Typography variant="caption">
                          Создал: {task.createdBy.name} • {formatDate(task.createdAt)}
                        </Typography>
                      </Box>
                    </>
                  }
                />
                <IconButton
                  component={Link}
                  to={`/tasks/${task.id}`}
                  color="primary"
                >
                  <ArrowIcon />
                </IconButton>
              </ListItem>
              <Divider variant="inset" component="li" />
            </React.Fragment>
          ))}
        </List>
      )}

      {/* Контекстное меню */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => navigate(`/tasks/${selectedTask}`)}>
          Открыть детали
        </MenuItem>
        <MenuItem onClick={() => navigate(`/tasks/${selectedTask}/edit`)}>
          Редактировать
        </MenuItem>
        <Divider />
        
        {Object.entries(STATUS_CONFIG).map(([status, { label, icon }]) => (
          <MenuItem 
            key={status}
            onClick={() => handleStatusChange(status as TaskStatus)}
            disabled={!!(selectedTask && tasks.find(t => t.id === selectedTask)?.status === status)} 
          >
            <ListItemAvatar>
              <Avatar sx={{ 
                bgcolor: `${STATUS_CONFIG[status as TaskStatus].color}.light`,
                width: 24,
                height: 24
              }}>
                {icon}
              </Avatar>
            </ListItemAvatar>
            {label}
          </MenuItem>
        ))}
        
        <Divider />
        <MenuItem 
          onClick={handleDeleteTask}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} /> Удалить
        </MenuItem>
      </Menu>
    </Container>
  );
};