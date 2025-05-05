import React, { useEffect, useState } from 'react';
import {
  Typography, TextField, Button, Box, CircularProgress, MenuItem,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { Task, UpdateTaskDto } from '../types/task';
import { updateTask, deleteTask, getTaskById } from '../api/tasks';

const statusOptions = ['todo', 'in_progress', 'done'];

const TaskDetailPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<UpdateTaskDto>({
    title: '',
    description: '',
    status: 'todo',
  });

  useEffect(() => {
    const loadTask = async () => {
      try {
        if (!taskId) return;
        const fetchedTask = await getTaskById(taskId);
        setTask(fetchedTask);
        setForm({
          title: fetchedTask.title,
          description: fetchedTask.description,
          status: fetchedTask.status,
        });
      } catch (error) {
        enqueueSnackbar('Не удалось загрузить задачу', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };
    loadTask();
  }, [taskId, enqueueSnackbar]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!taskId) return;
    setSaving(true);
    try {
      const updatedTask = await updateTask(taskId, form);
      setTask(updatedTask);
      enqueueSnackbar('Задача обновлена', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Ошибка при сохранении', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!taskId) return;
    try {
      await deleteTask(taskId);
      enqueueSnackbar('Задача удалена', { variant: 'success' });
      navigate('/tasks');
    } catch (error) {
      enqueueSnackbar('Ошибка при удалении', { variant: 'error' });
    }
  };

  if (loading) return <CircularProgress />;

  if (!task) return <Typography>Задача не найдена</Typography>;

  return (
    <Box maxWidth={600} mx="auto" p={2}>
      <Typography variant="h4" gutterBottom>
        Детали задачи
      </Typography>
      <TextField
        fullWidth
        label="Название"
        name="title"
        value={form.title}
        onChange={handleChange}
        margin="normal"
      />
      <TextField
        fullWidth
        label="Описание"
        name="description"
        value={form.description}
        onChange={handleChange}
        multiline
        rows={4}
        margin="normal"
      />
      <TextField
        fullWidth
        select
        label="Статус"
        name="status"
        value={form.status}
        onChange={handleChange}
        margin="normal"
      >
        {statusOptions.map((status) => (
          <MenuItem key={status} value={status}>
            {status}
          </MenuItem>
        ))}
      </TextField>
      <Box display="flex" gap={2} mt={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={saving}
        >
          Сохранить
        </Button>
        <Button variant="outlined" color="error" onClick={handleDelete}>
          Удалить
        </Button>
      </Box>
    </Box>
  );
};

export default TaskDetailPage;
