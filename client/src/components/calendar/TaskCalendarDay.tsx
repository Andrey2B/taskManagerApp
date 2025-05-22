import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import { Badge, Box } from '@mui/material';

// Используем Date как параметр типа:
interface TaskCalendarDayProps extends PickersDayProps<Date> {
  tasksCount?: number;
  onCustomSelect?: (date: Date) => void;
}

const TaskCalendarDay: React.FC<TaskCalendarDayProps> = ({
  tasksCount = 0,
  onCustomSelect,
  ...props
}) => {
  const handleClick = () => {
    if (onCustomSelect) {
      onCustomSelect(props.day);
    }
    if (props.onDaySelect) {
      props.onDaySelect(props.day);
    }
  };

  const getBadgeColor = () => {
    if (tasksCount > 5) return 'error';
    if (tasksCount >= 3) return 'warning';
    return 'primary';
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <PickersDay {...props} onClick={handleClick} />
      {tasksCount > 0 && (
        <Badge
          badgeContent={tasksCount}
          color={getBadgeColor()}
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
