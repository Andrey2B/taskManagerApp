import React from 'react';
import { IconButton, useTheme } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useThemeContext } from '../../hooks/useThemeContext';

const ThemeToggle: React.FC = () => {
  const theme = useTheme(); // тема MUI для определения текущего режима
  const { toggleTheme } = useThemeContext(); // твой ThemeContext с функцией toggle

  return (
    <IconButton onClick={toggleTheme} color="inherit">
      {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
    </IconButton>
  );
};

export default ThemeToggle;