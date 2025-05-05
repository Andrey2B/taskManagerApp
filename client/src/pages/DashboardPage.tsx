import { Box, Typography } from '@mui/material';
import TaskCard from '../components/tasks/TaskCard';
import { useTasks } from '../hooks/useTasks';

const DashboardPage = () => {
  const { tasks, loading } = useTasks();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Мои задачи</Typography>
      {loading ? (
        <Typography>Загрузка...</Typography>
      ) : (
        tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))
      )}
    </Box>
  );
};

export default DashboardPage;
