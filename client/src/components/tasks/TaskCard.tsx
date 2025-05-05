import { Card, CardContent, Typography, Chip, Stack, Fade, Button } from '@mui/material';
import { Task } from '../../types/task.d';

const TaskCard = ({ task }: { task: Task }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'primary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'info';
      case 'in_progress': return 'warning';
      case 'done': return 'success';
      default: return 'default';
    }
  };

  return (
    <Fade in={true}>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6">{task.title}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {task.description}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Chip label={task.status} size="small" color={getStatusColor(task.status)} />
            <Chip label={task.priority} size="small" color={getPriorityColor(task.priority)} />
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Created: {new Date(task.createdAt).toLocaleDateString()}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button size="small" variant="outlined">Edit</Button>
            <Button size="small" variant="outlined" color="error">Delete</Button>
          </Stack>
        </CardContent>
      </Card>
    </Fade>
  );
};

export default TaskCard;