import React, { useState } from 'react';
import { Box, Button, Container, TextField, Typography, MenuItem } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { createProject } from '../api/projects';
import { ProjectRole, ProjectStatus, CreateProjectData } from '../types/project';

const roles: ProjectRole[] = ['owner', 'developer', 'designer', 'manager', 'qa', 'analyst'];
const statuses: ProjectStatus[] = ['planning', 'active', 'archived', 'completed'];

export const NewProjectPage: React.FC = () => {
  const [formData, setFormData] = useState<CreateProjectData>({
    name: '',
    description: '',
    status: '' as ProjectStatus,
    role: '' as ProjectRole,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; status?: string; role?: string }>({});
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const handleChange = (field: keyof CreateProjectData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const newErrors: { name?: string; status?: string; role?: string } = {};
    if (!formData.name.trim()) newErrors.name = 'Название проекта обязательно';
    if (!formData.status) newErrors.status = 'Пожалуйста, выберите статус проекта';
    if (!formData.role) newErrors.role = 'Пожалуйста, выберите вашу роль в проекте';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      enqueueSnackbar('Пожалуйста, заполните все обязательные поля', { variant: 'warning' });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token') || '';
      const createdProject = await createProject(formData, token);

      enqueueSnackbar('Проект успешно создан', { variant: 'success' });

      navigate(`/projects/${createdProject.id}`);
    } catch (error: any) {
      console.error(error);
      enqueueSnackbar(error.message || 'Ошибка при создании проекта', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" mb={1}>Создать новый проект</Typography>
      <Typography variant="body2" color="textSecondary" mb={3}>
        <span style={{ color: 'red' }}>*</span> — обязательные поля
      </Typography>
      <Box component="form" noValidate autoComplete="off">
        <TextField
          label={<><span style={{ color: 'red' }}>*</span> Название проекта</>}
          fullWidth
          required
          margin="normal"
          value={formData.name}
          onChange={e => handleChange('name', e.target.value)}
          error={!!errors.name}
          helperText={errors.name || 'Введите уникальное имя проекта'}
        />
        <TextField
          label="Описание"
          fullWidth
          multiline
          rows={4}
          margin="normal"
          value={formData.description}
          onChange={e => handleChange('description', e.target.value)}
          helperText="Кратко опишите цель или детали проекта (необязательно)"
        />
        <TextField
          select
          label={<><span style={{ color: 'red' }}>*</span> Ваша роль в проекте</>}
          fullWidth
          margin="normal"
          value={formData.role}
          onChange={e => handleChange('role', e.target.value)}
          error={!!errors.role}
          helperText={errors.role || 'Выберите роль, которую будете выполнять в проекте'}
        >
          {roles.map(role => (
            <MenuItem key={role} value={role}>
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label={<><span style={{ color: 'red' }}>*</span> Статус проекта</>}
          fullWidth
          margin="normal"
          value={formData.status}
          onChange={e => handleChange('status', e.target.value)}
          error={!!errors.status}
          helperText={errors.status || 'Выберите текущий статус проекта'}
        >
          {statuses.map(status => (
            <MenuItem key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </MenuItem>
          ))}
        </TextField>
        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 3 }}
          onClick={handleSubmit}
          disabled={loading}
        >
          Создать проект
        </Button>
      </Box>
    </Container>
  );
};
