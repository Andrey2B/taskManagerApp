import React, { useState } from 'react';
import { TextField, Button, Box, Typography, CircularProgress } from '@mui/material';
import { login as apiLogin } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { User } from '../../types/auth';

interface LoginFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const LoginForm = ({ onSuccess, onError }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const data = await apiLogin(email, password);

      console.log('Данные пользователя:', data);

  
      if (data.token && data.user) {
        const userWithToken: User = {
          ...data.user,
          token: data.token,
        };
  
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(userWithToken));
  
        login(userWithToken);
      }

      setEmail('');
      setPassword('');

      onSuccess?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка входа';
      setError(message);
      onError?.(message);
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
