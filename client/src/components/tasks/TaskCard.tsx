import {
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Fade,
  Button,
  Link,
} from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { Task } from '../../types/task.d';

interface TaskCardProps {
  task: Task;
  readOnly?: boolean;
}

const TaskCard = ({ task, readOnly = false }: TaskCardProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'primary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return 'info';
      case 'in_progress':
        return 'warning';
      case 'done':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Fade in={true}>
      <Card
        sx={{
          mb: 2,
          cursor: readOnly ? 'default' : 'pointer',
          pointerEvents: readOnly ? 'none' : 'auto',
        }}
      >
        <CardContent>
          <Typography variant="h6">{task.title}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {task.description}
          </Typography>

          {/* Прикреплённые файлы */}
          {task.attachments && task.attachments.length > 0 && (
            <Stack direction="column" spacing={0.5} sx={{ mt: 1 }}>
              {task.attachments.map((file) => (
                <Stack
                  key={file.id}
                  direction="row"
                  alignItems="center"
                  spacing={1}
                >
                  <InsertDriveFileIcon fontSize="small" />
                  <Link
                    href={file.url}
                    download={file.name || file.url.split('/').pop()}
                    underline="hover"
                  >
                    {file.name || file.url.split('/').pop()}
                  </Link>
                </Stack>
              ))}
            </Stack>
          )}

          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Chip
              label={task.status}
              size="small"
              color={getStatusColor(task.status)}
            />
            <Chip
              label={task.priority}
              size="small"
              color={getPriorityColor(task.priority)}
            />
          </Stack>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, display: 'block' }}
          >
            Создано: {new Date(task.createdAt).toLocaleDateString()}
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block' }}
          >
            Обновлено: {new Date(task.updatedAt).toLocaleDateString()}
          </Typography>

          {task.dueDate && (
            <Typography
              variant="caption"
              color="error"
              sx={{ display: 'block' }}
            >
              Дедлайн: {new Date(task.dueDate).toLocaleDateString()}
            </Typography>
          )}

          {!readOnly && (
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Button size="small" variant="outlined">
                Edit
              </Button>
              <Button size="small" variant="outlined" color="error">
                Delete
              </Button>
            </Stack>
          )}
        </CardContent>
      </Card>
    </Fade>
  );
};

export default TaskCard;
