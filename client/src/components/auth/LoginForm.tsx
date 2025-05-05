import React, { useState } from 'react';
import { TextField, Button, Box, Typography, CircularProgress } from '@mui/material';
import { login } from '../../api/auth';

interface LoginFormProps {
  onSuccess?: () => void; // Колбэк при успешном входе
  onError?: (error: string) => void;
}

export const LoginForm = ({ onSuccess, onError }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const data = await login(email, password);

      console.log('Данные пользователя:', data);

    // Если сервер возвращает токен, сохраняем его
    if (data.token) {
      localStorage.setItem('token', data.token);
    }

    // Очистка полей после успешного входа
    setEmail('');
    setPassword('');

      onSuccess?.(); // Вызываем onSuccess при успешном входе
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка входа';
      setError(message);
      onError?.(message); // Вызываем onError при ошибке
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <TextField
        label="Email"
        type="email"
        fullWidth
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isLoading}
        required
        error={!!error}
        sx={{ mb: 2 }}
      />
      <TextField
        label="Password"
        type="password"
        fullWidth
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={isLoading}
        required
        error={!!error}
        sx={{ mb: 3 }}
      />
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      <Button type="submit" variant="contained" fullWidth disabled={isLoading} sx={{ py: 1.5 }}>
        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Войти'}
      </Button>
    </Box>
  );
};

export default LoginForm;
