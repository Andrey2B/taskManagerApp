import React, { useEffect, useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  MenuItem, 
  Grid,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Avatar,
  Typography,
  Box
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Task, TaskPriority, TaskStatus } from '../../types/task';
import { useProjects } from '../../hooks/useProjects';
import { useUsers } from '../../hooks/useUsers';
import { useVoice } from '../../hooks/useVoice';
import VoiceButton from '../ui/VoiceButton';
import { formatDate } from '../../utils/date';

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (taskData: Partial<Task>) => void;
  initialData?: Partial<Task>;
}

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
  { value: 'blocked', label: 'Blocked' },
];

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
  const { users } = useUsers();
  const { voiceCommand, startVoice } = useVoice();
  const [isVoiceActive, setIsVoiceActive] = useState(false);

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
    onSubmit: (values) => {
      onSubmit({
        ...values,
        dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
      });
      onClose();
    },
    enableReinitialize: true,
  });

  useEffect(() => {
    if (!voiceCommand) return;

    // Обработка голосовых команд
    if (voiceCommand.includes('create task')) {
      formik.setFieldValue('title', voiceCommand.replace('create task', '').trim());
    } else if (voiceCommand.includes('priority')) {
      const priority = voiceCommand.match(/high|medium|low|critical/i)?.[0].toLowerCase();
      if (priority) formik.setFieldValue('priority', priority);
    } else if (voiceCommand.includes('status')) {
      const status = voiceCommand.match(/todo|in progress|done|blocked/i)?.[0].toLowerCase().replace(' ', '-');
      if (status) formik.setFieldValue('status', status);
    }
  }, [voiceCommand]);

  const handleVoiceInput = () => {
    setIsVoiceActive(true);
    startVoice();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {initialData?.id ? 'Edit Task' : 'Create New Task'}
        <Box sx={{ position: 'absolute', right: 8, top: 8 }}>
          <VoiceButton 
            active={isVoiceActive}
            onClick={handleVoiceInput}
            tooltip="Voice control"
          />
        </Box>
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
                  onChange={formik.handleChange}
                  error={formik.touched.projectId && Boolean(formik.errors.projectId)}
                  label="Project"
                >
                  {projects.map((project) => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.name}
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
                    const user = users.find(u => u.id === selected);
                    return user ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar src={user.avatar} sx={{ width: 24, height: 24 }} />
                        <Typography>{user.name}</Typography>
                      </Box>
                    ) : null;
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
                            fontSize: '0.7rem'
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
                  {statusOptions.map((option) => (
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