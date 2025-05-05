import React from 'react';
import { Box, Typography } from '@mui/material';

const NotFoundPage: React.FC = () => {
  return (
    <Box sx={{ textAlign: 'center', mt: 5 }}>
      <Typography variant="h4" color="error">
        404 - Page Not Found
      </Typography>
    </Box>
  );
};

export default NotFoundPage;
