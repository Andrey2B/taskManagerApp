import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Paper,
  Box,
  List,
  ListItem,
  ListItemText,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Stack,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useAuth } from '../context/AuthContext';

import { Project } from '../types/project';
import { Task, TaskStatus, TaskPriority, TaskComment } from '../types/task';
import { User } from '../types/auth';

// axios инстанс
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
});

export const ProjectPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    assignedTo: undefined,
  });

  const [creatingTask, setCreatingTask] = useState(false);
  const [commentInputs, setCommentInputs] = useState<{ [taskId: string]: string }>({});
  const [filterUserId, setFilterUserId] = useState<string | null>(null);

  const { user: currentUser, token } = useAuth();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingProject, setDeletingProject] = useState(false);

  // Хелперы для пользователя
  const getUserId = (user: string | User) => (typeof user === 'string' ? user : user.id);
  const getUserName = (user: string | User) => (typeof user === 'string' ? user : user.name);

  // Проверяем, есть ли у текущего пользователя роль owner в проекте
  const isOwner = () => {
    if (!project || !currentUser) return false;
    const member = project.members.find(m => getUserId(m.user) === currentUser.id);
    return member?.role === 'owner';
  };

  // API вызовы
  const fetchProject = async (projectId: string, token: string) => {
    return api.get<Project>(`/projects/${projectId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => res.data);
  };

  const fetchTasks = async (projectId: string, token: string) => {
    return api.get<Task[]>(`/projects/${projectId}/tasks`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => res.data);
  };

  const createTask = async (task: Partial<Task>, token: string) => {
    const payload = {
      title: task.title,
      description: task.description,
      projectId: task.projectId,
      assignedTo: typeof task.assignedTo === 'string' ? task.assignedTo : task.assignedTo?.id,
      dueDate: task.dueDate,
      priority: task.priority,
    };
    return api.post<Task>('/tasks', payload, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => res.data);
  };

  const updateTaskStatus = async (taskId: string, status: TaskStatus, token: string) => {
    return api.patch(`/tasks/${taskId}`, { status }, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const createComment = async (taskId: string, text: string, token: string) => {
    return api.post<TaskComment>(`/tasks/${taskId}/comments`, { text }, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => res.data);
  };

  // Удаление проекта
  const deleteProject = async () => {
    if (!projectId || !token) return;
    setDeletingProject(true);
    setError(null);
    try {
      await api.delete(`/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/projects');
    } catch (e) {
      console.error(e);
      setError('Ошибка при удалении проекта');
    } finally {
      setDeletingProject(false);
      setDeleteDialogOpen(false);
    }
  };

  // Загрузка проекта и задач
  useEffect(() => {
    if (!projectId || !token) {
      navigate('/projects');
      return;
    }

    setLoading(true);
    setError(null);

    Promise.all([fetchProject(projectId, token), fetchTasks(projectId, token)])
      .then(([proj, tasks]) => {
        setProject(proj);
        setTasks(tasks);
      })
      .catch((e) => {
        console.error(e);
        setError('Ошибка загрузки данных');
      })
      .finally(() => setLoading(false));
  }, [projectId, navigate, token]);

  // Обработчики

  const handleCreateTask = async () => {
    if (!newTask.title?.trim()) return;
    setCreatingTask(true);
    setError(null);
    try {
      const created = await createTask({
        ...newTask,
        projectId: projectId!,
        createdBy: currentUser || undefined,
      }, token!);
      setTasks(prev => [...prev, created]);
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        assignedTo: undefined,
      });
    } catch (e) {
      console.error(e);
      setError('Ошибка при создании задачи');
    }
    setCreatingTask(false);
  };

  const handleAddComment = async (taskId: string) => {
    const text = commentInputs[taskId]?.trim();
    if (!text) return;
    setError(null);
    try {
      const comment = await createComment(taskId, text, token!);
      setTasks(prev =>
        prev.map(t =>
          t.id === taskId ? { ...t, comments: [...(t.comments || []), comment] } : t
        )
      );
      setCommentInputs(prev => ({ ...prev, [taskId]: '' }));
    } catch (e) {
      console.error(e);
      setError('Ошибка при добавлении комментария');
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    setError(null);
    try {
      await updateTaskStatus(taskId, newStatus, token!);
      setTasks(prev =>
        prev.map(t => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
    } catch (e) {
      console.error(e);
      setError('Ошибка при обновлении статуса задачи');
    }
  };

  // Фильтрация задач по назначенному пользователю
  const filteredTasks = filterUserId
    ? tasks.filter(task => {
        const assignedId = typeof task.assignedTo === 'string' ? task.assignedTo : task.assignedTo?.id;
        return assignedId === filterUserId;
      })
    : tasks;

  // Рендер

  if (loading) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h6">Загрузка проекта...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h6" color="error">{error}</Typography>
      </Container>
    );
  }

  if (!project) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h6" color="error">Проект не найден</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Button onClick={() => navigate('/projects')} sx={{ mb: 2 }}>← Назад к проектам</Button>

      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" gutterBottom>{project.name}</Typography>
        {isOwner() && (
          <Button
            variant="outlined"
            color="error"
            onClick={() => setDeleteDialogOpen(true)}
          >
            Удалить проект
          </Button>
        )}
      </Box>

      <Typography variant="body1" paragraph>{project.description}</Typography>
      <Typography variant="subtitle2" color="text.secondary" paragraph>
        Статус: {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
      </Typography>

      {/* Участники с аватарами и ролями */}
      <Typography variant="subtitle2" gutterBottom>Участники:</Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap">
        {project.members.map((member) => {
          const user = member.user as User;
          return (
            <Tooltip
              key={user.id}
              title={`${user.name}${member.role ? ` — ${member.role}` : ''}`}
            >
              <Avatar
                src={user.avatar}
                alt={user.name}
                sx={{ width: 32, height: 32, fontSize: 14, cursor: 'default' }}
              >
                {!user.avatar && user.name.charAt(0).toUpperCase()}
              </Avatar>
            </Tooltip>
          );
        })}
      </Stack>

      {/* Фильтр по пользователю */}
      <FormControl fullWidth margin="normal" size="small">
        <InputLabel id="filter-user-label">Фильтр по пользователю</InputLabel>
        <Select
          labelId="filter-user-label"
          value={filterUserId || ''}
          label="Фильтр по пользователю"
          onChange={e => setFilterUserId(e.target.value || null)}
        >
          <MenuItem value="">Все пользователи</MenuItem>
          {project.members.map(member => (
            <MenuItem key={getUserId(member.user)} value={getUserId(member.user)}>
              {getUserName(member.user)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Задачи</Typography>
        {filteredTasks.length === 0 && <Typography>Нет задач</Typography>}

        {filteredTasks.map((task) => (
          <Paper key={task.id} sx={{ mb: 2, p: 2 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap">
              <Typography
                variant="subtitle1"
                sx={{ textDecoration: task.status === 'done' ? 'line-through' : 'none', fontWeight: 'bold' }}
              >
                {task.title}
              </Typography>

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel id={`status-label-${task.id}`}>Статус</InputLabel>
                <Select
                  labelId={`status-label-${task.id}`}
                  value={task.status}
                  label="Статус"
                  onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                >
                  <MenuItem value="todo">В работе</MenuItem>
                  <MenuItem value="in-progress">В процессе</MenuItem>
                  <MenuItem value="done">Выполнено</MenuItem>
                  <MenuItem value="blocked">Заблокировано</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Typography variant="body2" paragraph>{task.description}</Typography>

            <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
              <Typography variant="caption">Приоритет: {task.priority}</Typography>
              {task.dueDate && (
                <Box display="flex" alignItems="center" gap={0.5}>
                  <CalendarMonthIcon fontSize="small" />
                  <Typography variant="caption">
                    {new Date(task.dueDate).toLocaleDateString()}
                  </Typography>
                </Box>
              )}
              <Typography variant="caption">
                Назначена: {typeof task.assignedTo === 'string'
                  ? task.assignedTo
                  : task.assignedTo?.name || '—'}
              </Typography>
            </Box>

            <Box mt={2}>
              <Typography variant="subtitle2">Комментарии:</Typography>
              {task.comments && task.comments.length > 0 ? (
                <List dense>
                  {task.comments.map((comment) => (
                    <ListItem key={comment.id}>
                      <ListItemText
                        primary={comment.text}
                        secondary={`${typeof comment.author === 'string'
                          ? comment.author
                          : comment.author.name} — ${new Date(comment.createdAt).toLocaleString()}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="caption">Комментариев нет</Typography>
              )}

              {/* Форма добавления комментария */}
              <Box display="flex" mt={1} gap={1} flexWrap="wrap">
                <TextField
                  label="Добавить комментарий"
                  size="small"
                  fullWidth
                  value={commentInputs[task.id] || ''}
                  onChange={e => setCommentInputs(prev => ({ ...prev, [task.id]: e.target.value }))}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleAddComment(task.id)}
                  disabled={!commentInputs[task.id]?.trim()}
                >
                  Добавить
                </Button>
              </Box>
            </Box>
          </Paper>
        ))}
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Создать новую задачу</Typography>
        <Box display="flex" flexDirection="column" gap={2} maxWidth={600}>
          <TextField
            label="Название"
            value={newTask.title || ''}
            onChange={e => setNewTask(prev => ({ ...prev, title: e.target.value }))}
            fullWidth
            required
          />
          <TextField
            label="Описание"
            value={newTask.description || ''}
            onChange={e => setNewTask(prev => ({ ...prev, description: e.target.value }))}
            fullWidth
            multiline
            rows={3}
          />
          <FormControl fullWidth>
            <InputLabel id="assigned-user-label">Назначить</InputLabel>
            <Select
              labelId="assigned-user-label"
              value={newTask.assignedTo ? (typeof newTask.assignedTo === 'string' ? newTask.assignedTo : newTask.assignedTo.id) : ''}
              label="Назначить"
              onChange={e => {
                const selectedUser = project?.members.find(m => getUserId(m.user) === e.target.value);
                setNewTask(prev => ({ ...prev, assignedTo: selectedUser ? selectedUser.user : undefined }));
              }}
            >
              <MenuItem value="">Не назначать</MenuItem>
              {project?.members.map(member => (
                <MenuItem key={getUserId(member.user)} value={getUserId(member.user)}>
                  {getUserName(member.user)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="priority-label">Приоритет</InputLabel>
            <Select
              labelId="priority-label"
              value={newTask.priority || 'medium'}
              label="Приоритет"
              onChange={e => setNewTask(prev => ({ ...prev, priority: e.target.value as TaskPriority }))}
            >
              <MenuItem value="low">Низкий</MenuItem>
              <MenuItem value="medium">Средний</MenuItem>
              <MenuItem value="high">Высокий</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Срок"
            type="date"
            value={newTask.dueDate || ''}
            onChange={e => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
            InputLabelProps={{ shrink: true }}
          />
          <Button
            variant="contained"
            onClick={handleCreateTask}
            disabled={creatingTask || !newTask.title?.trim()}
          >
            Создать
          </Button>
        </Box>
      </Paper>

      {/* Диалог подтверждения удаления проекта */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы уверены, что хотите удалить проект &quot;{project.name}&quot;? Это действие невозможно отменить.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
          <Button
            onClick={deleteProject}
            color="error"
            disabled={deletingProject}
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
