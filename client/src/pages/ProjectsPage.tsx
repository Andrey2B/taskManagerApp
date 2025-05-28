import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  Typography,
  TextField,
  IconButton
} from '@mui/material';
import { Add, Search, FilterList } from '@mui/icons-material';
import { Project } from '../types/project';
import { getProjects } from '../api/projects';
import { getCurrentUser } from '../api/auth'; // Импортируем новый запрос

export const ProjectsPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null); // Состояние для хранения информации о текущем пользователе
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('Токен не найден');
          setLoading(false);
          return;
        }

        // Получаем проекты с использованием токена
        const projectsFromServer = await getProjects(token);
        setProjects(projectsFromServer);

        // Получаем информацию о текущем пользователе без передачи токена в функцию
        const userFromServer = await getCurrentUser(); // getCurrentUser больше не принимает token как аргумент
        setCurrentUser(userFromServer);
      } catch (error) {
        console.error('Ошибка загрузки проектов:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateProject = () => {
    navigate('/projects/new');
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const handleGetUserInfo = async () => {
    try {
      const user = await getCurrentUser(); // Получаем текущего пользователя
      alert(`Текущий пользователь: ${user.name}, ${user.email}`);
    } catch (error) {
      console.error('Ошибка при получении информации о пользователе:', error);
      alert('Не удалось получить информацию о пользователе');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          Мои проекты
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateProject}
        >
          Создать проект
        </Button>
      </Box>

      {/* Кнопка для получения информации о текущем пользователе */}
      <Box mb={4}>
        <Button variant="outlined" onClick={handleGetUserInfo}>
          Получить информацию о текущем пользователе
        </Button>
      </Box>

      {currentUser && (
        <Box mb={4}>
          <Typography variant="h6">
            Информация о пользователе:
          </Typography>
          <Typography variant="body1">
            Имя: {currentUser.name}
          </Typography>
          <Typography variant="body1">
            Email: {currentUser.email}
          </Typography>
        </Box>
      )}

      <Box mb={4}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Поиск проектов..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <IconButton>
                <Search />
              </IconButton>
            ),
            endAdornment: searchTerm && (
              <IconButton onClick={() => setSearchTerm('')}>
                <FilterList />
              </IconButton>
            ),
          }}
        />
      </Box>

      {projects.length === 0 ? (
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mt: 4 }}>
          Проектов пока нет (｡╯︵╰｡)
        </Typography>
      ) : filteredProjects.length === 0 ? (
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mt: 4 }}>
          Проекты не найдены
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {filteredProjects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: 3,
                    transform: 'translateY(-2px)',
                    transition: 'all 0.3s ease',
                  },
                }}
                onClick={() => handleProjectClick(project.id)}
              >
                <CardContent>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {project.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {project.description}
                  </Typography>
                  <Typography variant="caption" color={project.status === 'active' ? 'success.main' : 'text.secondary'}>
                    {project.status === 'active' ? 'Активный' : 'Завершен'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};
