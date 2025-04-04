import React from 'react';
import { Card, CardContent, Typography, Chip, Stack } from '@mui/material';
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

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6">{task.title}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {task.description}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Chip label={task.status} size="small" />
          <Chip label={task.priority} size="small" color={getPriorityColor(task.priority)} />
        </Stack>
      </CardContent>
    </Card>
  );
};

export default TaskCard;