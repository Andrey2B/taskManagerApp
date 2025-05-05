import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';
import { Box, Button, Paper, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar(); // Инициализация Snackbar

  const handleAuthSuccess = () => {
    enqueueSnackbar('Успешный вход! Добро пожаловать 👋', { variant: 'success' });
    navigate('/dashboard');
  };
  
  const handleError = (error: any) => {
    console.error('Ошибка авторизации:', error);
    enqueueSnackbar('Ошибка входа: ' + error.message || 'Неверные данные', {
      variant: 'error',
    });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default'
      }}
    >
      <Paper elevation={3} sx={{ p: 4, width: 400 }}>
        <Typography variant="h5" align="center" sx={{ mb: 3 }}>
          {isLogin ? 'Вход в систему' : 'Регистрация'}
        </Typography>
        
        {isLogin ? (
          <LoginForm 
            onSuccess={handleAuthSuccess} 
            onError={handleError} 
          />
        ) : (
          <RegisterForm 
            onSuccess={handleAuthSuccess} 
            onError={handleError} 
          />
        )}
        <Button
          fullWidth
          color="secondary"
          sx={{ mt: 2 }}
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войдите'}
        </Button>
      </Paper>
    </Box>
  );
};
