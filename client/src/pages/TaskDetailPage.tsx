import React, { useEffect, useState, ChangeEvent } from 'react';
import {
  Typography, TextField, Button, Box, CircularProgress, MenuItem,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { Task } from '../types/task';
import { updateTask, deleteTask, getTaskById } from '../api/tasks';

const statusOptions = ['todo', 'in_progress', 'done'];
const MAX_FILES = 5;

const TaskDetailPage: React.FC = () => {
  const { id: taskId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'todo',
  });
  const [attachments, setAttachments] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);

  useEffect(() => {
    const loadTask = async () => {
      if (!taskId) return;
      setLoading(true);
      try {
        const fetchedTask = await getTaskById(taskId);
        setTask(fetchedTask);
        setForm({
          title: fetchedTask.title || '',
          description: fetchedTask.description || '',
          status: fetchedTask.status || 'todo',
        });
      } catch (error) {
        enqueueSnackbar('Не удалось загрузить задачу', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };
    loadTask();
  }, [taskId, enqueueSnackbar]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);

      if (attachments.length + newFiles.length > MAX_FILES) {
        setFileError(`Можно прикрепить не более ${MAX_FILES} файлов.`);
        return;
      }

      setAttachments(prev => [...prev, ...newFiles]);
      e.target.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
    setFileError(null);
  };

  const handleSave = async () => {
    if (!taskId) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title ?? '');
      formData.append('description', form.description ?? '');
      formData.append('status', form.status ?? '');

      attachments.forEach((file) => {
        formData.append('attachments', file);
      });

      const updatedTask = await updateTask(taskId, formData);
      setTask(updatedTask);
      enqueueSnackbar('Задача обновлена', { variant: 'success' });
    } catch (error) {
      console.error('Ошибка при обновлении задачи:', error);
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
      navigate(-1);
    } catch (error) {
      console.error('Ошибка при удалении задачи:', error);
      enqueueSnackbar('Ошибка при удалении', { variant: 'error' });
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  if (!task) {
    return <Typography align="center">Задача не найдена</Typography>;
  }

  return (
    <Box maxWidth={600} mx="auto" p={2}>
      <Typography variant="h4" gutterBottom>
        Редактировать задачу
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

      {Array.isArray(task.attachments) && task.attachments.length > 0 && (
        <Box mt={2}>
          <Typography variant="subtitle1">Прикреплённые файлы:</Typography>
          {task.attachments.map((file, index) => (
            <Box key={index}>
              <a
                href={file.url}
                download={file.name || file.url.split('/').pop()}
                target="_blank"
                rel="noopener noreferrer"
              >
                {file.name || file.url.split('/').pop()}
              </a>
            </Box>
          ))}
        </Box>
      )}

      <Box mt={2}>
        <Typography variant="subtitle1">Добавить/заменить файлы:</Typography>
        <Button variant="outlined" component="label">
          Выбрать файлы
          <input
            type="file"
            multiple
            hidden
            onChange={handleFileChange}
            accept="*"
          />
        </Button>
        {fileError && (
          <Typography color="error" mt={1}>
            {fileError}
          </Typography>
        )}
        {attachments.length > 0 && (
          <Box mt={1}>
            <Typography variant="subtitle2">Выбранные файлы:</Typography>
            {attachments.map((file, index) => (
              <Box key={index} display="flex" alignItems="center" gap={1} mt={0.5}>
                <Typography noWrap sx={{ maxWidth: 300 }}>{file.name}</Typography>
                <Button size="small" color="error" onClick={() => handleRemoveFile(index)}>
                  Удалить
                </Button>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      <Box display="flex" gap={2} mt={3}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Сохраняем...' : 'Сохранить'}
        </Button>
        <Button
          variant="outlined"
          color="error"
          onClick={handleDelete}
        >
          Удалить
        </Button>
      </Box>
    </Box>
  );
};

export default TaskDetailPage;
