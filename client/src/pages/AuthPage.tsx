import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm, RegisterForm } from '../components/auth';
import { Box, Button, Paper, Typography } from '@mui/material';

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  // Функция, которая выполнится после успешного входа
  const handleAuthSuccess = () => {
    navigate('/dashboard'); // Перенаправление после успешной аутентификации
    // Можно добавить:
    // - Загрузку данных пользователя
    // - Обновление контекста авторизации
    // - Показ уведомления
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
          <LoginForm onSuccess={handleSuccess} />
        ) : (
          <RegisterForm onSuccess={handleSuccess} />
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