import { Box, Typography } from '@mui/material';
import TaskList from '../../components/tasks/TaskList';
import { useTasks } from '../../hooks/useTasks';

const DashboardPage = () => {
  const { tasks, loading } = useTasks();

  return (
    <Box>
      <Typography variant="h4">Мои задачи</Typography>
      {loading ? (
        <div>Загрузка...</div>
      ) : (
        <TaskList tasks={tasks} />
      )}
    </Box>
  );
};

export default DashboardPage;