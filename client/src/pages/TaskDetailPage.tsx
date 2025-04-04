// src/pages/TaskDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Avatar,
  Button,
  IconButton,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  TextField,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Badge,
  Tabs,
  Tab
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
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
  Person as PersonIcon,
  MoreTime as DueDateIcon,
  CalendarToday as CreatedIcon,
  Update as UpdatedIcon
} from '@mui/icons-material';
import { Task, TaskStatus, TaskPriority, TaskComment, Attachment, UpdateTaskDto } from '../types/task';
import { useSnackbar } from 'notistack';
import { formatDate } from '../utils/dateUtils';

const statusIcons = {
  'todo': <TodoIcon fontSize="small" />,
  'in-progress': <InProgressIcon fontSize="small" color="primary" />,
  'done': <DoneIcon fontSize="small" color="success" />,
  'blocked': <BlockedIcon fontSize="small" color="error" />
};

const priorityIcons = {
  'critical': <CriticalIcon color="error" />,
  'high': <HighIcon color="warning" />,
  'medium': <MediumIcon color="info" />,
  'low': <LowIcon color="success" />
};

const statusLabels = {
  'todo': 'К выполнению',
  'in-progress': 'В работе',
  'done': 'Завершено',
  'blocked': 'Заблокировано'
};

const priorityLabels = {
  'critical': 'Критическая',
  'high': 'Высокая',
  'medium': 'Средняя',
  'low': 'Низкая'
};

export const TaskDetailPage = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'attachments'>('details');
  const [taskForm, setTaskForm] = useState<UpdateTaskDto>({
    title: '',
    description: '',
    status: undefined,
    priority: undefined,
    dueDate: undefined
  });

  // Загрузка задачи
  useEffect(() => {
    const fetchTask = async () => {
      try {
        // Замените на реальный API-запрос
        const mockTask: Task = {
          id: taskId || '1',
          title: 'Рефакторинг модуля авторизации',
          description: 'Необходимо переписать модуль авторизации с использованием JWT и refresh токенов',
          status: 'in-progress',
          priority: 'high',
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(), // +3 дня
          projectId: '1',
          assignedTo: { id: 'user1', name: 'Иван Иванов', email: 'ivan@example.com', avatar: '' },
          createdBy: { id: 'user2', name: 'Мария Петрова', email: 'maria@example.com', avatar: '' },
          comments: [
            {
              id: '1',
              text: 'Начни с реализации базового JWT-провайдера',
              author: { id: 'user2', name: 'Мария Петрова', email: 'maria@example.com', avatar: '' },
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 часа назад
            }
          ],
          attachments: [
            {
              id: '1',
              name: 'Требования.docx',
              url: '/attachments/1',
              type: 'document',
              size: 1024 * 1024 * 2, // 2 MB
              uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 день назад
            }
          ],
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 дня назад
          updatedAt: new Date().toISOString()
        };

        setTask(mockTask);
        setTaskForm({
          title: mockTask.title,
          description: mockTask.description,
          status: mockTask.status,
          priority: mockTask.priority,
          dueDate: mockTask.dueDate
        });
        setLoading(false);
      } catch (error) {
        enqueueSnackbar('Ошибка загрузки задачи', { variant: 'error' });
        setLoading(false);
      }
    };

    fetchTask();
  }, [taskId, enqueueSnackbar]);

  const handleStatusChange = (newStatus: TaskStatus) => {
    if (!task) return;
    
    const updatedTask = { ...task, status: newStatus, updatedAt: new Date().toISOString() };
    setTask(updatedTask);
    enqueueSnackbar(`Статус изменен на "${statusLabels[newStatus]}"`, { variant: 'success' });
    // Здесь должен быть вызов API для сохранения
  };

  const handleDeleteTask = () => {
    // Логика удаления задачи
    enqueueSnackbar('Задача удалена', { variant: 'success' });
    navigate('/tasks');
    setDeleteDialogOpen(false);
  };

  const handleSaveChanges = () => {
    if (!task) return;
    
    const updatedTask = { ...task, ...taskForm, updatedAt: new Date().toISOString() };
    setTask(updatedTask);
    setEditMode(false);
    enqueueSnackbar('Изменения сохранены', { variant: 'success' });
    // Здесь должен быть вызов API для сохранения
  };

  const handleAddComment = () => {
    if (!task || !newComment.trim()) return;
    
    const comment: TaskComment = {
      id: `comment-${Date.now()}`,
      text: newComment,
      author: { id: 'current-user', name: 'Вы', email: '', avatar: '' },
      createdAt: new Date().toISOString()
    };
    
    setTask({
      ...task,
      comments: [...task.comments, comment],
      updatedAt: new Date().toISOString()
    });
    setNewComment('');
    // Здесь должен быть вызов API для сохранения комментария
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTaskForm(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!task) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h5">Задача не найдена</Typography>
        <Button 
          component={Link}
          to="/tasks"
          variant="contained"
          sx={{ mt: 2 }}
        >
          Вернуться к списку задач
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/tasks')} sx={{ mr: 1 }}>
          <BackIcon />
        </IconButton>
        {editMode ? (
          <TextField
            name="title"
            value={taskForm.title}
            onChange={handleFormChange}
            variant="standard"
            fullWidth
            sx={{ 
              fontSize: '1.5rem',
              fontWeight: 'bold',
              '& .MuiInputBase-input': { fontSize: '1.5rem' }
            }}
          />
        ) : (
          <Typography variant="h4" component="h1">
            {task.title}
          </Typography>
        )}
        
        <Box sx={{ flexGrow: 1 }} />
        
        {editMode ? (
          <>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveChanges}
              sx={{ mr: 1 }}
            >
              Сохранить
            </Button>
            <Button
              variant="outlined"
              onClick={() => setEditMode(false)}
            >
              Отмена
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => setEditMode(true)}
              sx={{ mr: 1 }}
            >
              Редактировать
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setDeleteDialogOpen(true)}
            >
              Удалить
            </Button>
          </>
        )}
      </Box>

      {/* Основная информация */}
      <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
        <Chip
          icon={statusIcons[task.status]}
          label={statusLabels[task.status]}
          color={
            task.status === 'done' ? 'success' :
            task.status === 'blocked' ? 'error' : 'primary'
          }
          variant="outlined"
        />
        
        <Chip
          icon={priorityIcons[task.priority]}
          label={priorityLabels[task.priority]}
          color={
            task.priority === 'critical' ? 'error' :
            task.priority === 'high' ? 'warning' :
            task.priority === 'medium' ? 'info' : 'success'
          }
          variant="outlined"
        />
        
        {task.dueDate && (
          <Tooltip title={`Срок выполнения: ${formatDate(task.dueDate)}`}>
            <Chip
              icon={<DueDateIcon />}
              label={formatDate(task.dueDate)}
              color={new Date(task.dueDate) < new Date() && task.status !== 'done' ? 'error' : 'default'}
              variant="outlined"
            />
          </Tooltip>
        )}
        
        <Tooltip title={`Создал: ${task.createdBy.name}`}>
          <Chip
            avatar={<Avatar src={task.createdBy.avatar}>{task.createdBy.name[0]}</Avatar>}
            label={task.createdBy.name}
            variant="outlined"
          />
        </Tooltip>
        
        {task.assignedTo && (
          <Tooltip title={`Исполнитель: ${task.assignedTo.name}`}>
            <Chip
              avatar={<Avatar src={task.assignedTo.avatar}>{task.assignedTo.name[0]}</Avatar>}
              label={task.assignedTo.name}
              variant="outlined"
            />
          </Tooltip>
        )}
      </Box>

      {/* Вкладки */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
        >
          <Tab label="Детали" value="details" />
          <Tab 
            label={
              <Badge badgeContent={task.comments.length} color="primary">
                Комментарии
              </Badge>
            } 
            value="comments" 
          />
          <Tab 
            label={
              <Badge badgeContent={task.attachments.length} color="primary">
                Вложения
              </Badge>
            } 
            value="attachments" 
          />
        </Tabs>
        <Divider />
        
        {/* Содержимое вкладок */}
        <Box sx={{ p: 3 }}>
          {activeTab === 'details' && (
            <>
              {editMode ? (
                <TextField
                  name="description"
                  value={taskForm.description}
                  onChange={handleFormChange}
                  multiline
                  rows={6}
                  fullWidth
                  variant="outlined"
                  sx={{ mb: 3 }}
                />
              ) : (
                <Typography paragraph sx={{ mb: 3, whiteSpace: 'pre-line' }}>
                  {task.description || 'Нет описания'}
                </Typography>
              )}
              
              <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
                <Chip
                  icon={<CreatedIcon />}
                  label={`Создано: ${formatDate(task.createdAt)}`}
                  variant="outlined"
                />
                <Chip
                  icon={<UpdatedIcon />}
                  label={`Обновлено: ${formatDate(task.updatedAt)}`}
                  variant="outlined"
                />
              </Box>
              
              <Button
                component={Link}
                to={`/projects/${task.projectId}`}
                variant="outlined"
                startIcon={<PersonIcon />}
              >
                Перейти к проекту
              </Button>
            </>
          )}
          
          {activeTab === 'comments' && (
            <>
              <List>
                {task.comments.map((comment) => (
                  <React.Fragment key={comment.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar src={comment.author.avatar}>
                          {comment.author.name[0]}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <>
                            <Typography fontWeight="bold" component="span">
                              {comment.author.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                              {formatDate(comment.createdAt)}
                            </Typography>
                          </>
                        }
                        secondary={
                          <Typography sx={{ whiteSpace: 'pre-line' }}>
                            {comment.text}
                          </Typography>
                        }
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
              
              <Box sx={{ mt: 3 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                  label="Новый комментарий"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <Box display="flex" justifyContent="flex-end" mt={1}>
                  <Button
                    variant="contained"
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    startIcon={<CommentIcon />}
                  >
                    Добавить
                  </Button>
                </Box>
              </Box>
            </>
          )}
          
          {activeTab === 'attachments' && (
            <>
              {task.attachments.length === 0 ? (
                <Typography color="text.secondary" textAlign="center" py={4}>
                  Нет вложений
                </Typography>
              ) : (
                <List>
                  {task.attachments.map((file) => (
                    <ListItem 
                      key={file.id}
                      button
                      component="a"
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ListItemAvatar>
                        <Avatar>
                          <AttachmentIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={file.name}
                        secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB • ${formatDate(file.uploadedAt)}`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
              
              <Box display="flex" justifyContent="center" mt={2}>
                <Button
                  variant="outlined"
                  startIcon={<AttachFileIcon />}
                >
                  Загрузить файл
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Paper>

      {/* Быстрое изменение статуса */}
      <Box display="flex" justifyContent="center" gap={2} mb={3}>
        {Object.entries(statusLabels).map(([status, label]) => (
          <Button
            key={status}
            variant={task.status === status ? "contained" : "outlined"}
            color={
              status === 'done' ? 'success' :
              status === 'blocked' ? 'error' : 'primary'
            }
            startIcon={statusIcons[status as TaskStatus]}
            onClick={() => handleStatusChange(status as TaskStatus)}
            disabled={task.status === status}
          >
            {label}
          </Button>
        ))}
      </Box>

      {/* Диалог удаления */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Удалить задачу?</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить задачу "{task.title}"? Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
          <Button 
            onClick={handleDeleteTask}
            color="error"
            variant="contained"
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};