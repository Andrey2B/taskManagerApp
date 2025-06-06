import React, { useState } from 'react';
import Grid from '@mui/material/Grid';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Avatar,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Task, TaskPriority } from '../../types/task';
import { useProjectUsers } from '../../hooks/useProjectUsers';
import { taskStatusOptions } from './TaskStatus';
import { useNavigate } from 'react-router-dom';

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
  initialData?: Partial<Task>;
  projectId: string;
}

const priorityOptions: { value: TaskPriority; label: string }[] = [
  { value: 'low', label: 'Низкий' },
  { value: 'medium', label: 'Средний' },
  { value: 'high', label: 'Высокий' },
  { value: 'critical', label: 'Критический' },
];

const taskTypes = [
  { value: 'development', label: 'Разработка' },
  { value: 'marketing', label: 'Маркетинг' },
  { value: 'design', label: 'Дизайн' },
  { value: 'research', label: 'Исследование' },
];

const validationSchema = yup.object({
  title: yup.string().required('Название задачи обязательно'),
  description: yup.string().required('Описание обязательно'),
  status: yup.string().required('Статус обязателен'),
  priority: yup.string().required('Приоритет обязателен'),
  type: yup.string().required('Тип задачи обязателен'),
  dueDate: yup.date().nullable(),
  assignedTo: yup.string().nullable(),
});

const MAX_FILES = 5;

const TaskForm: React.FC<TaskFormProps> = ({ open, onClose, onSubmit, initialData, projectId }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const { users: userList, isLoading } = useProjectUsers(initialData?.projectId || '');
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      status: initialData?.status || 'todo', 
      priority: initialData?.priority || 'medium', 
      type: initialData?.type || '',
      dueDate: initialData?.dueDate ? new Date(initialData.dueDate) : null,
      assignedTo: initialData?.assignedTo || '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: () => {},
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      if (files.length + newFiles.length > MAX_FILES) {
        setFileError(`Можно прикрепить не более ${MAX_FILES} файлов.`);
        return;
      }
      setFiles(prev => [...prev, ...newFiles]);
      e.target.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setFileError(null);
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append('title', formik.values.title);
    formData.append('description', formik.values.description);
    formData.append('status', formik.values.status);
    formData.append('priority', formik.values.priority);
    formData.append('type', formik.values.type);
    formData.append('projectId', projectId);
    if (typeof formik.values.assignedTo === 'string') {
      formData.append('assignedTo', formik.values.assignedTo);
    }
    if (formik.values.dueDate) {
      formData.append('dueDate', formik.values.dueDate.toISOString());
    }
    files.forEach((file, i) => {
      formData.append(`attachments[${i}]`, file);
    });
    formData.append('authorId', 'currentUserId');

    try {
      await onSubmit(formData);
      onClose();
      navigate(`/projects/${projectId}`);
    } catch (error) {
      console.error('Ошибка при отправке задачи:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{initialData?.id ? 'Редактировать задачу' : 'Создать задачу'}</DialogTitle>
      <DialogContent dividers>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={<>Название задачи <span style={{ color: 'red' }}>*</span></>}
                id="title"
                name="title"
                value={formik.values.title}
                onChange={formik.handleChange}
                error={formik.touched.title && Boolean(formik.errors.title)}
                helperText={formik.touched.title && formik.errors.title}
                autoFocus
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label={<>Описание <span style={{ color: 'red' }}>*</span></>}
                id="description"
                name="description"
                multiline
                rows={4}
                value={formik.values.description}
                onChange={formik.handleChange}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={formik.touched.type && Boolean(formik.errors.type)}>
                <InputLabel id="type-label">Тип задачи <span style={{ color: 'red' }}>*</span></InputLabel>
                <Select
                  labelId="type-label"
                  id="type"
                  name="type"
                  value={formik.values.type}
                  onChange={formik.handleChange}
                  label="Тип задачи"
                >
                  {taskTypes.map((t) => (
                    <MenuItem key={t.value} value={t.value}>
                      {t.label}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.type && formik.errors.type && (
                  <Typography variant="caption" color="error" sx={{ ml: 2 }}>
                    {formik.errors.type}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="assigned-label">Назначено</InputLabel>
                {isLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : (
                  <Select
                    labelId="assigned-label"
                    id="assignedTo"
                    name="assignedTo"
                    value={formik.values.assignedTo}
                    onChange={formik.handleChange}
                    label="Назначено"
                  >
                    <MenuItem value="">Не назначено</MenuItem>
                    {userList.map(user => (
                      <MenuItem key={user.id} value={user.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar src={user.avatar} sx={{ width: 24, height: 24 }} />
                          <Typography>{user.name}</Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth error={formik.touched.status && Boolean(formik.errors.status)}>
                <InputLabel id="status-label">Статус <span style={{ color: 'red' }}>*</span></InputLabel>
                <Select
                  labelId="status-label"
                  id="status"
                  name="status"
                  value={formik.values.status}
                  onChange={formik.handleChange}
                  label="Статус"
                >
                  {taskStatusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.status && formik.errors.status && (
                  <Typography variant="caption" color="error" sx={{ ml: 2 }}>
                    {formik.errors.status}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth error={formik.touched.priority && Boolean(formik.errors.priority)}>
                <InputLabel id="priority-label">Приоритет <span style={{ color: 'red' }}>*</span></InputLabel>
                <Select
                  labelId="priority-label"
                  id="priority"
                  name="priority"
                  value={formik.values.priority}
                  onChange={formik.handleChange}
                  label="Приоритет"
                >
                  {priorityOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.priority && formik.errors.priority && (
                  <Typography variant="caption" color="error" sx={{ ml: 2 }}>
                    {formik.errors.priority}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <DatePicker
                label="Дедлайн"
                value={formik.values.dueDate}
                onChange={(date) => formik.setFieldValue('dueDate', date)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: formik.touched.dueDate && Boolean(formik.errors.dueDate),
                    helperText: formik.touched.dueDate && formik.errors.dueDate,
                  },
                }}
              />
              <Box mt={1}>
                <Button size="small" onClick={() => formik.setFieldValue('dueDate', null)}>
                  Очистить дедлайн
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Button variant="outlined" component="label">
                Прикрепить файлы
                <input hidden type="file" onChange={handleFileChange} multiple />
              </Button>
              {fileError && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  {fileError}
                </Alert>
              )}
              {files.length > 0 && (
                <Box mt={1}>
                  <Typography variant="subtitle2">Выбранные файлы:</Typography>
                  {files.map((file, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Typography noWrap sx={{ maxWidth: 300 }}>{file.name}</Typography>
                      <Button size="small" color="error" onClick={() => handleRemoveFile(index)}>
                        Удалить
                      </Button>
                    </Box>
                  ))}
                </Box>
              )}
            </Grid>
          </Grid>
        </LocalizationProvider>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {initialData?.id ? 'Обновить' : 'Создать'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskForm;
