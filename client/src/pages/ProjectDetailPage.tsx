import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Box, Container, Typography, Paper, Avatar, Button, IconButton,
  Tabs, Tab, Divider, List, ListItem, ListItemText, ListItemAvatar,
  Chip, CircularProgress, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField
} from '@mui/material';
import {
  ArrowBack as BackIcon, Edit as EditIcon, Delete as DeleteIcon,
  Add as AddIcon, Person as PersonIcon, Task as TaskIcon, Settings as SettingsIcon
} from '@mui/icons-material';
import { Task } from '../types/task';
import { Project } from '../types/project';
import { useSnackbar } from 'notistack';
import { useProjectUsers } from '../hooks/useProjectUsers';
import { useAuth } from '../hooks/useAuth';
import { useProjectRoles } from '../hooks/useProjectRoles';

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
  const [projectForm, setProjectForm] = useState({ name: '', description: '' });

  const { user } = useAuth();
  const { currentRole, handleProjectLogin } = useProjectRoles();
  const users = useProjectUsers(projectId ?? '');

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        if (user && projectId) {
          await handleProjectLogin(user.id, projectId);
        }

        const [projectRes, tasksRes] = await Promise.all([
          axios.get<Project>(`/api/projects/${projectId}`),
          axios.get<Task[]>(`/api/projects/${projectId}/tasks`)
        ]);

        setProject(projectRes.data);
        setTasks(tasksRes.data);
        setProjectForm({
          name: projectRes.data.name,
          description: projectRes.data.description || ''
        });
      } catch (error) {
        enqueueSnackbar('Ошибка загрузки данных проекта', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [user, projectId, enqueueSnackbar]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: 'tasks' | 'members' | 'settings') => {
    setActiveTab(newValue);
  };

  const handleDeleteProject = async () => {
    try {
      await axios.delete(`/api/projects/${projectId}`);
      enqueueSnackbar('Проект удален', { variant: 'success' });
      navigate('/projects');
    } catch {
      enqueueSnackbar('Ошибка при удалении проекта', { variant: 'error' });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleSaveProject = async () => {
    try {
      const updatedProject = {
        ...project,
        name: projectForm.name,
        description: projectForm.description
      };

      await axios.put(`/api/projects/${projectId}`, updatedProject);
      setProject(updatedProject as Project);
      enqueueSnackbar('Изменения сохранены', { variant: 'success' });
      setEditMode(false);
    } catch {
      enqueueSnackbar('Ошибка при сохранении изменений', { variant: 'error' });
    }
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

  if (!projectId || !project) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h5">Проект не найден</Typography>
        <Button component={Link} to="/projects" variant="contained" sx={{ mt: 2 }}>
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
          <Box>
            <Typography variant="h4" component="h1">{project.name}</Typography>
            {currentRole && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Ваша роль в проекте: {currentRole}
              </Typography>
            )}
          </Box>
        )}

        <Box sx={{ flexGrow: 1 }} />

        {editMode ? (
          <>
            <Button variant="contained" color="primary" onClick={handleSaveProject} sx={{ mr: 1 }}>
              Сохранить
            </Button>
            <Button variant="outlined" onClick={() => setEditMode(false)}>Отмена</Button>
          </>
        ) : (
          <>
            <IconButton onClick={() => setEditMode(true)} sx={{ mr: 1 }}>
              <EditIcon />
            </IconButton>
            <IconButton onClick={() => setDeleteDialogOpen(true)} color="error">
              <DeleteIcon />
            </IconButton>
          </>
        )}
      </Box>

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
                    <ListItem key={task.id} button component={Link} to={`/tasks/${task.id}`}>
                      <ListItemAvatar>
                        <Avatar><TaskIcon /></Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={task.title}
                        secondary={
                          <>
                            <Typography variant="body2">{task.description}</Typography>
                            <Chip label={task.status} size="small" sx={{ mt: 0.5 }} />
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </>
          )}
          {/* Остальные вкладки аналогично */}
        </Box>
      </Paper>

      {/* Диалог удаления проекта */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Удалить проект?</DialogTitle>
        <DialogContent>
          <Typography>Вы уверены, что хотите удалить проект "{project.name}"? Это действие нельзя отменить.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleDeleteProject} color="error" variant="contained">Удалить</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
