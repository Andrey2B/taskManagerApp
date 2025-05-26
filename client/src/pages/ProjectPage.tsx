import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  TextField,
  Button,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';

type Task = {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
};

type Project = {
  id: number;
  name: string;
  description: string;
};

const mockFetchProject = async (projectId: string): Promise<Project> => {
  // Имитируем запрос
  return new Promise((res) =>
    setTimeout(
      () =>
        res({
          id: Number(projectId),
          name: `Проект №${projectId}`,
          description: 'Описание проекта, например, для планирования задач и трекинга.',
        }),
      500
    )
  );
};

const mockFetchTasks = async (projectId: string): Promise<Task[]> => {
  // Имитируем загрузку задач
  return new Promise((res) =>
    setTimeout(
      () =>
        res([
          { id: 1, title: 'Задача 1', description: 'Описание задачи 1', completed: false },
          { id: 2, title: 'Задача 2', description: 'Описание задачи 2', completed: true },
        ]),
      500
    )
  );
};

const mockCreateTask = async (projectId: string, task: Partial<Task>): Promise<Task> => {
  // Имитируем создание задачи
  return new Promise((res) =>
    setTimeout(
      () =>
        res({
          id: Math.floor(Math.random() * 10000),
          title: task.title || 'Новая задача',
          description: task.description || '',
          completed: false,
        }),
      500
    )
  );
};

export const ProjectPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [creatingTask, setCreatingTask] = useState(false);

  useEffect(() => {
    if (!projectId) {
      navigate('/projects'); // если нет id, возвращаемся к списку проектов
      return;
    }

    setLoading(true);

    Promise.all([mockFetchProject(projectId), mockFetchTasks(projectId)])
      .then(([projectData, tasksData]) => {
        setProject(projectData);
        setTasks(tasksData);
      })
      .finally(() => setLoading(false));
  }, [projectId, navigate]);

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return;

    setCreatingTask(true);
    try {
      const created = await mockCreateTask(projectId!, {
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim(),
      });
      setTasks((prev) => [...prev, created]);
      setNewTaskTitle('');
      setNewTaskDescription('');
    } catch (e) {
      alert('Ошибка при создании задачи');
    }
    setCreatingTask(false);
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h6">Загрузка проекта...</Typography>
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

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Задачи
        </Typography>
        {tasks.length === 0 && <Typography>Нет задач</Typography>}

        <List>
          {tasks.map((task) => (
            <React.Fragment key={task.id}>
              <ListItem>
                <ListItemText
                  primary={task.title}
                  secondary={task.description}
                />
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))}
        </List>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Создать новую задачу
        </Typography>
        <Box component="form" noValidate autoComplete="off">
          <TextField
            label="Название задачи"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Описание задачи"
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
            fullWidth
            multiline
            rows={3}
            margin="normal"
          />
          <Button
            variant="contained"
            onClick={handleCreateTask}
            disabled={creatingTask || !newTaskTitle.trim()}
            sx={{ mt: 2 }}
          >
            {creatingTask ? 'Создаём...' : 'Создать задачу'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};
