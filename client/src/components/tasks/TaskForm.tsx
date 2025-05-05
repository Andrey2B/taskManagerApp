import React, { useState, useEffect } from 'react';
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
  Chip,
  Avatar,
  Typography,
  Box,
  SelectChangeEvent,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Task, TaskPriority, TaskStatus } from '../../types/task';
import { useProjects } from '../../hooks/useProjects';
import { useProjectUsers } from '../../hooks/useProjectUsers';
import { taskStatusOptions } from './TaskStatus';

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (taskData: Partial<Task>) => Promise<void>;
  initialData?: Partial<Task>;
}

const priorityOptions: { value: TaskPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const validationSchema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  status: yup.string().required('Status is required'),
  priority: yup.string().required('Priority is required'),
  dueDate: yup.date().nullable(),
  projectId: yup.string().required('Project is required'),
  assignedTo: yup.string().nullable(),
});

const TaskForm: React.FC<TaskFormProps> = ({ open, onClose, onSubmit, initialData }) => {
  const { projects } = useProjects();
  const initialProjectId = initialData?.projectId || '';
  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProjectId);

  const users = useProjectUsers(selectedProjectId);
  const assignedUser =
    users.find((u) => u.id === initialData?.assignedTo) ??
    (initialData?.assignedTo
      ? { id: initialData.assignedTo, name: 'Unknown User', avatar: '', role: 'unknown' }
      : null);

  const formik = useFormik({
    initialValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      status: initialData?.status || 'todo',
      priority: initialData?.priority || 'medium',
      dueDate: initialData?.dueDate ? new Date(initialData.dueDate) : null,
      projectId: initialData?.projectId || '',
      assignedTo: initialData?.assignedTo || '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await onSubmit({
          ...values,
          dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
        });
        onClose();
      } catch (error) {
        console.error('Ошибка при отправке задачи:', error);
      }
    },
    enableReinitialize: true,
  });

  const handleProjectChange = (event: SelectChangeEvent) => {
    const projectId = event.target.value;
    setSelectedProjectId(projectId);
    formik.setFieldValue('projectId', projectId);
    formik.setFieldValue('assignedTo', ''); // сброс назначенного пользователя при смене проекта
  };

  useEffect(() => {
    if (initialData?.projectId) {
      setSelectedProjectId(initialData.projectId);
    }
  }, [initialData?.projectId]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {initialData?.id ? 'Edit Task' : 'Create New Task'}
        <Box sx={{ position: 'absolute', right: 8, top: 8 }} />
      </DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="title"
                name="title"
                label="Task Title"
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
                id="description"
                name="description"
                label="Description"
                multiline
                rows={4}
                value={formik.values.description}
                onChange={formik.handleChange}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="project-label">Project</InputLabel>
                <Select
                  labelId="project-label"
                  id="projectId"
                  name="projectId"
                  value={formik.values.projectId}
                  onChange={handleProjectChange}
                  error={formik.touched.projectId && Boolean(formik.errors.projectId)}
                  label="Project"
                >
                  {taskStatusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                    {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="assigned-label">Assign To</InputLabel>
                <Select
                  labelId="assigned-label"
                  id="assignedTo"
                  name="assignedTo"
                  value={formik.values.assignedTo}
                  onChange={formik.handleChange}
                  label="Assign To"
                  renderValue={(selected) => {
                    if (!selected) return 'None';
                    const user = users.find((u) => u.id === selected) || assignedUser;
                    return user ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar src={user.avatar} sx={{ width: 24, height: 24 }} />
                        <Typography>{user.name}</Typography>
                      </Box>
                    ) : 'Unknown';
                  }}
                >
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar src={user.avatar} sx={{ width: 24, height: 24 }} />
                        <Typography>{user.name}</Typography>
                        <Chip
                          label={user.role}
                          size="small"
                          sx={{
                            ml: 'auto',
                            textTransform: 'capitalize',
                            fontSize: '0.7rem',
                          }}
                        />
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  id="status"
                  name="status"
                  value={formik.values.status}
                  onChange={formik.handleChange}
                  error={formik.touched.status && Boolean(formik.errors.status)}
                  label="Status"
                >
                  {taskStatusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="priority-label">Priority</InputLabel>
                <Select
                  labelId="priority-label"
                  id="priority"
                  name="priority"
                  value={formik.values.priority}
                  onChange={formik.handleChange}
                  error={formik.touched.priority && Boolean(formik.errors.priority)}
                  label="Priority"
                >
                  {priorityOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <DatePicker
                label="Due Date"
                format="DD.MM.YYYY"
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
                  Clear Due Date
                </Button>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" color="primary" variant="contained">
            {initialData?.id ? 'Update Task' : 'Create Task'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TaskForm;
