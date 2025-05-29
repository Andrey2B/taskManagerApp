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
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useAuth } from '../context/AuthContext';

import { Project } from '../types/project';
import { Task, TaskStatus, TaskPriority, TaskComment } from '../types/task';
import { User } from '../types/auth';

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

  const { user: currentUser, token } = useAuth();

  // --- API запросы ---

  const fetchProject = async (projectId: string) => {
    return axios.get<Project>(`/projects/${projectId}`).then(res => res.data);
  };

  const fetchTasks = async (projectId: string) => {
    return axios.get<Task[]>(`/projects/${projectId}/tasks`).then(res => res.data);
  };

  const createTask = async (task: Partial<Task>) => {
    const payload = {
      title: task.title,
      description: task.description,
      projectId: task.projectId,
      assignedTo: typeof task.assignedTo === 'string' ? task.assignedTo : task.assignedTo?.id,
      dueDate: task.dueDate,
      priority: task.priority,
    };
    return axios.post<Task>('/tasks', payload).then(res => res.data);
  };

  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    return axios.patch(`/tasks/${taskId}`, { status });
  };

  const createComment = async (taskId: string, text: string) => {
    return axios
      .post<TaskComment>(`/tasks/${taskId}/comments`, { text })
      .then(res => res.data);
  };

  // --- Эффект загрузки данных ---

  useEffect(() => {
    if (!projectId) {
      navigate('/projects');
      return;
    }
    setLoading(true);
    setError(null);

    Promise.all([fetchProject(projectId), fetchTasks(projectId)])
      .then(([proj, tasks]) => {
        setProject(proj);
        setTasks(tasks);
      })
      .catch((e) => {
        console.error(e);
        setError('Ошибка загрузки данных');
      })
      .finally(() => setLoading(false));
  }, [projectId, navigate]);

  // --- Обработчики ---

  const handleCreateTask = async () => {
    if (!newTask.title?.trim()) return;
    setCreatingTask(true);
    setError(null);
    try {
      const created = await createTask({
        ...newTask,
        projectId: projectId!,
        createdBy: currentUser || undefined,
      });
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
      const comment = await createComment(taskId, text);
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
      await updateTaskStatus(taskId, newStatus);
      setTasks(prev =>
        prev.map(t => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
    } catch (e) {
      console.error(e);
      setError('Ошибка при обновлении статуса задачи');
    }
  };

  // --- Хелперы для User или string ---

  const getUserId = (user: string | User) => (typeof user === 'string' ? user : user.id);
  const getUserName = (user: string | User) => (typeof user === 'string' ? user : user.name);

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
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Container>
    );
  }

  if (!project) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h6" color="error">
          Проект не найден
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Button onClick={() => navigate('/projects')} sx={{ mb: 2 }}>
        ← Назад к проектам
      </Button>

      <Typography variant="h4" gutterBottom>
        {project.name}
      </Typography>
      <Typography variant="body1" paragraph>
        {project.description}
      </Typography>
      <Typography variant="subtitle2" color="text.secondary" paragraph>
        Статус: {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
      </Typography>
      <Typography variant="subtitle2" paragraph>
        Участники:{' '}
        {project.members
          .map((m) => getUserName(m.user))
          .join(', ')}
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Задачи
        </Typography>
        {tasks.length === 0 && <Typography>Нет задач</Typography>}

        {tasks.map((task) => (
          <Paper key={task.id} sx={{ mb: 2, p: 2 }}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              flexWrap="wrap"
            >
              <Typography
                variant="subtitle1"
                sx={{
                  textDecoration: task.status === 'done' ? 'line-through' : 'none',
                  fontWeight: 'bold',
                }}
              >
                {task.title}
              </Typography>

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel id={`status-label-${task.id}`}>Статус</InputLabel>
                <Select
                  labelId={`status-label-${task.id}`}
                  value={task.status}
                  label="Статус"
                  onChange={(e) =>
                    handleStatusChange(task.id, e.target.value as TaskStatus)
                  }
                >
                  <MenuItem value="todo">В работе</MenuItem>
                  <MenuItem value="in-progress">В процессе</MenuItem>
                  <MenuItem value="done">Выполнено</MenuItem>
                  <MenuItem value="blocked">Заблокировано</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Typography variant="body2" paragraph>
              {task.description}
            </Typography>

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
                Назначена:{' '}
                {typeof task.assignedTo === 'string'
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
                <Typography variant="body2" color="text.secondary">
                  Нет комментариев
                </Typography>
              )}
              <Box display="flex" gap={1} mt={1}>
                <TextField
                  size="small"
                  fullWidth
                  variant="outlined"
                  placeholder="Добавить комментарий"
                  value={commentInputs[task.id] || ''}
                  onChange={(e) =>
                    setCommentInputs((prev) => ({ ...prev, [task.id]: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment(task.id);
                    }
                  }}
                />
                <Button variant="contained" onClick={() => handleAddComment(task.id)}>
                  Отправить
                </Button>
              </Box>
            </Box>
          </Paper>
        ))}
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Создать новую задачу
        </Typography>

        <TextField
          label="Название"
          fullWidth
          margin="normal"
          value={newTask.title || ''}
          onChange={(e) => setNewTask((prev) => ({ ...prev, title: e.target.value }))}
        />
        <TextField
          label="Описание"
          fullWidth
          multiline
          rows={3}
          margin="normal"
          value={newTask.description || ''}
          onChange={(e) =>
            setNewTask((prev) => ({ ...prev, description: e.target.value }))
          }
        />
        <FormControl fullWidth margin="normal" size="small">
          <InputLabel id="priority-label">Приоритет</InputLabel>
          <Select
            labelId="priority-label"
            value={newTask.priority || 'medium'}
            label="Приоритет"
            onChange={(e) =>
              setNewTask((prev) => ({
                ...prev,
                priority: e.target.value as TaskPriority,
              }))
            }
          >
            <MenuItem value="low">Низкий</MenuItem>
            <MenuItem value="medium">Средний</MenuItem>
            <MenuItem value="high">Высокий</MenuItem>
            <MenuItem value="critical">Критический</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Срок выполнения"
          type="date"
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          value={newTask.dueDate ? newTask.dueDate.slice(0, 10) : ''}
          onChange={(e) => setNewTask((prev) => ({ ...prev, dueDate: e.target.value }))}
        />
        <FormControl fullWidth margin="normal" size="small">
          <InputLabel id="assignedTo-label">Назначить</InputLabel>
          <Select
            labelId="assignedTo-label"
            value={
              (newTask.assignedTo &&
              typeof newTask.assignedTo === 'object'
                ? newTask.assignedTo.id
                : newTask.assignedTo) || ''
            }
            label="Назначить"
            onChange={(e) =>
              setNewTask((prev) => ({
                ...prev,
                assignedTo: e.target.value || undefined,
              }))
            }
          >
            <MenuItem value="">Не назначено</MenuItem>
            {project.members.map((member) => (
              <MenuItem key={getUserId(member.user)} value={getUserId(member.user)}>
                {getUserName(member.user)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box mt={2}>
          <Button
            variant="contained"
            onClick={handleCreateTask}
            disabled={creatingTask || !newTask.title?.trim()}
          >
            Создать
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};
