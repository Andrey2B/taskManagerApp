import { PickersDay, PickersDayProps } from '@mui/x-date-pickers';
import { Badge, Box } from '@mui/material';

interface TaskCalendarDayProps extends PickersDayProps<Date> {
  tasksCount?: number;
}

const TaskCalendarDay: React.FC<TaskCalendarDayProps> = ({ tasksCount = 0, ...props }) => {
  return (
    <Box sx={{ position: 'relative' }}>
      <PickersDay {...props} />
      {tasksCount > 0 && (
        <Badge
          badgeContent={tasksCount}
          color="primary"
          sx={{
            position: 'absolute',
            top: 4,
            right: 4,
            '& .MuiBadge-badge': {
              fontSize: '0.6rem',
              height: 16,
              minWidth: 16,
            },
          }}
        />
      )}
    </Box>
  );
};

export default TaskCalendarDay;