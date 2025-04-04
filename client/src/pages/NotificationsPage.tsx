import React from 'react';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Link,
  Chip,
  Box,
  IconButton,
  Divider,
  useTheme
} from '@mui/material';
import {
  Task as TaskIcon,
  AssignmentTurnedIn as AssignedIcon,
  SwapHoriz as StatusChangeIcon,
  GroupAdd as ProjectInviteIcon,
  Comment as CommentIcon,
  Check as MarkReadIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { formatDate } from '../utils/date';
import { Notification } from '../types/notification';

const NotificationsPage = () => {
  const theme = useTheme();
  
  // Моковые данные - замените на реальные данные из API
  const [notifications, setNotifications] = React.useState<Notification[]>([
    {
      id: '1',
      type: 'task_assigned',
      read: false,
      data: {
        task: { id: '1', title: 'Разработать интерфейс уведомлений' },
        changedBy: 'Иванова Д.С.'
      },
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      type: 'task_status_changed',
      read: true,
      data: {
        task: { id: '2', title: 'Интеграция с СберБокс', status: 'in-progress' },
        changedBy: 'Запольских Н.В.'
      },
      createdAt: '2025-04-01T10:30:00Z'
    }
  ]);

  const translateStatus = (status?: string) => {
    const statusMap: Record<string, string> = {
      'todo': 'К выполнению',
      'in-progress': 'В работе',
      'done': 'Завершена',
      'blocked': 'Заблокирована'
    };
    return status ? statusMap[status] || status : 'Неизвестный статус';
  };

  const getNotificationDetails = (notification: Notification) => {
    switch (notification.type) {
      case 'task_assigned':
        return {
          icon: <AssignedIcon color="primary" />,
          text: `Вам назначена задача: "${notification.data.task?.title}"`,
          action: `Инициатор: ${notification.data.changedBy}`,
          link: `/tasks/${notification.data.task?.id}`
        };
      case 'task_status_changed':
        return {
          icon: <StatusChangeIcon color="secondary" />,
          text: `Изменен статус задачи: "${notification.data.task?.title}"`,
          action: `Новый статус: ${translateStatus(notification.data.task?.status)}`,
          link: `/tasks/${notification.data.task?.id}`
        };
      case 'project_invite':
        return {
          icon: <ProjectInviteIcon color="success" />,
          text: `Приглашение в проект: "${notification.data.project?.name}"`,
          action: 'Нажмите для принятия',
          link: `/projects/${notification.data.project?.id}`
        };
      case 'new_comment':
        return {
          icon: <CommentIcon color="info" />,
          text: `Новый комментарий к задаче: "${notification.data.task?.title}"`,
          action: notification.data.comment,
          link: `/tasks/${notification.data.task?.id}#comments`
        };
      default:
        return {
          icon: <TaskIcon />,
          text: 'Новое уведомление',
          action: '',
          link: '#'
        };
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
    // Здесь должен быть вызов API для обновления статуса
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
    // Здесь должен быть вызов API для удаления
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Уведомления
        <Chip 
          label={`${notifications.filter(n => !n.read).length} новых`} 
          color="primary" 
          size="small"
          sx={{ ml: 2 }}
        />
      </Typography>

      <List sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
        {notifications.map((notification) => {
          const details = getNotificationDetails(notification);
          
          return (
            <React.Fragment key={notification.id}>
              <ListItem
                sx={{
                  bgcolor: notification.read ? undefined : theme.palette.action.selected,
                  '&:hover': { bgcolor: theme.palette.action.hover }
                }}
                secondaryAction={
                  <Box>
                    <IconButton 
                      edge="end" 
                      onClick={() => markAsRead(notification.id)}
                      title="Пометить как прочитанное"
                    >
                      <MarkReadIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => deleteNotification(notification.id)}
                      title="Удалить уведомление"
                      sx={{ ml: 1 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {details.icon}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Link to={details.link} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <Typography sx={{ fontWeight: notification.read ? 'normal' : 'bold' }}>
                        {details.text}
                      </Typography>
                    </Link>
                  }
                  secondary={
                    <>
                      <Typography variant="body2">{details.action}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(notification.createdAt)}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          );
        })}
      </List>
    </Box>
  );
};

export default NotificationsPage; // 👈 Default export