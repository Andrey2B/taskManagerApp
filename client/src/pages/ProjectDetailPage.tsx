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
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Person as PersonIcon,
  Task as TaskIcon,
  Settings as SettingsIcon,
  Comment as CommentIcon
} from '@mui/icons-material';
import { Project, Task } from '../types';
import { useSnackbar } from 'notistack';

export const ProjectDetailPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<'tasks' | 'members' | 'settings'>('tasks');
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: ''
  });

  // Загрузка данных проекта
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        // Моковые данные - замените на реальный API-запрос
        const mockProject: Project = {
          id: projectId || '1',
          name: 'Разработка нового интерфейса',
          description: 'Создание современного UI/UX для платформы',
          status: 'active',
          createdAt: new Date().toISOString(),
          createdBy: 'user1',
          members: [
            { id: 'user1', name: 'Иван Иванов', role: 'owner' },
            { id: 'user2', name: 'Мария Петрова', role: 'developer' },
            { id: 'user3', name: 'Алексей Сидоров', role: 'designer' }
          ]
        };

        const mockTasks: Task[] = [
          {
            id: 'task1',
            title: 'Дизайн главной страницы',
            description: 'Создать макеты для главной страницы',
            status: 'in_progress',
            projectId: projectId || '1',
            assignedTo: 'user3',
            createdAt: new Date().toISOString()
          },
          {
            id: 'task2',
            title: 'API для авторизации',
            description: 'Реализовать endpoints для auth',
            status: 'todo',
            projectId: projectId || '1',
            assignedTo: 'user2',
            createdAt: new Date().toISOString()
          }
        ];

        setProject(mockProject);
        setTasks(mockTasks);
        setProjectForm({
          name: mockProject.name,
          description: mockProject.description || ''
        });
        setLoading(false);
      } catch (error) {
        enqueueSnackbar('Ошибка загрузки проекта', { variant: 'error' });
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId, enqueueSnackbar]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: 'tasks' | 'members' | 'settings') => {
    setActiveTab(newValue);
  };

  const handleDeleteProject = () => {
    // Логика удаления проекта
    enqueueSnackbar('Проект удален', { variant: 'success' });
    navigate('/projects');
    setDeleteDialogOpen(false);
  };

  const handleSaveProject = () => {
    // Логика сохранения изменений
    setProject(prev => prev ? {
      ...prev,
      name: projectForm.name,
      description: projectForm.description
    } : null);
    setEditMode(false);
    enqueueSnackbar('Изменения сохранены', { variant: 'success' });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProjectForm(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!project) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h5">Проект не найден</Typography>
        <Button 
          component={Link}
          to="/projects"
          variant="contained"
          sx={{ mt: 2 }}
        >
          Вернуться к списку проектов
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/projects')} sx={{ mr: 1 }}>
          <BackIcon />
        </IconButton>
        {editMode ? (
          <TextField
            name="name"
            value={projectForm.name}
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
            {project.name}
          </Typography>
        )}
        
        <Box sx={{ flexGrow: 1 }} />
        
        {editMode ? (
          <>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveProject}
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
            <IconButton
              onClick={() => setEditMode(true)}
              sx={{ mr: 1 }}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              onClick={() => setDeleteDialogOpen(true)}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </>
        )}
      </Box>

      <Box display="flex" mb={3}>
        <Chip
          label={project.status === 'active' ? 'Активный' : 'Архивный'}
          color={project.status === 'active' ? 'success' : 'default'}
          size="small"
          sx={{ mr: 1 }}
        />
        <Typography variant="body2" color="text.secondary">
          Создан: {new Date(project.createdAt).toLocaleDateString()}
        </Typography>
      </Box>

      {editMode ? (
        <TextField
          name="description"
          value={projectForm.description}
          onChange={handleFormChange}
          multiline
          rows={3}
          fullWidth
          variant="outlined"
          sx={{ mb: 3 }}
        />
      ) : (
        <Typography paragraph sx={{ mb: 3 }}>
          {project.description || 'Нет описания'}
        </Typography>
      )}

      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Задачи" value="tasks" icon={<TaskIcon />} iconPosition="start" />
          <Tab label="Участники" value="members" icon={<PersonIcon />} iconPosition="start" />
          <Tab label="Настройки" value="settings" icon={<SettingsIcon />} iconPosition="start" />
        </Tabs>
        <Divider />

        <Box sx={{ p: 3 }}>
          {activeTab === 'tasks' && (
            <>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography variant="h6">Задачи проекта</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate(`/projects/${projectId}/new-task`)}
                >
                  Новая задача
                </Button>
              </Box>
              
              {tasks.length === 0 ? (
                <Typography color="text.secondary" textAlign="center" py={4}>
                  Нет задач в этом проекте
                </Typography>
              ) : (
                <List>
                  {tasks.map((task) => (
                    <ListItem
                      key={task.id}
                      button
                      component={Link}
                      to={`/tasks/${task.id}`}
                    >
                      <ListItemAvatar>
                        <Avatar>
                          <TaskIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={task.title}
                        secondary={
                          <>
                            <Typography variant="body2" component="span">
                              {task.description}
                            </Typography>
                            <br />
                            <Chip
                              label={task.status === 'todo' ? 'К выполнению' : 
                                     task.status === 'in_progress' ? 'В работе' : 'Завершено'}
                              size="small"
                              sx={{ mt: 0.5 }}
                            />
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </>
          )}

          {activeTab === 'members' && (
            <>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography variant="h6">Участники проекта</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => console.log('Invite member')}
                >
                  Пригласить
                </Button>
              </Box>
              
              <List>
                {project.members.map((member) => (
                  <ListItem key={member.id}>
                    <ListItemAvatar>
                      <Avatar>
                        <PersonIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={member.name}
                      secondary={
                        <Chip
                          label={member.role === 'owner' ? 'Владелец' : 
                                 member.role === 'developer' ? 'Разработчик' : 'Дизайнер'}
                          size="small"
                        />
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}

          {activeTab === 'settings' && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Настройки проекта
              </Typography>
              <Typography paragraph>
                Здесь будут настройки проекта, права доступа и другие параметры.
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Диалог удаления проекта */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Удалить проект?</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить проект "{project.name}"? Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
          <Button 
            onClick={handleDeleteProject}
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