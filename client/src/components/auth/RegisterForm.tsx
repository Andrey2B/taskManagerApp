import React, { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  // FormControl,
  // InputLabel,
  // Select,
  // MenuItem,
  // SelectChangeEvent,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { register } from '../../api/auth';
import { RegisterFormProps } from '../../types/auth';

export const RegisterForm = ({ onSuccess, onError }: RegisterFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate(); // 👈 для перехода

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target as HTMLInputElement | {
      name?: string;
      value: unknown;
    };

    if (typeof name === 'string') {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      onSuccess?.();

      // ✅ После успешной регистрации переходим на страницу проектов
      navigate('/projects'); // Убедись, что этот путь есть в ваших маршрутах
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Ошибка регистрации';
      setError(message);
      onError?.(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <TextField
        label="Имя"
        name="name"
        fullWidth
        margin="normal"
        value={formData.name}
        onChange={handleChange}
        disabled={isLoading}
        required
        sx={{ mb: 2 }}
      />
      <TextField
        label="Email"
        type="email"
        name="email"
        fullWidth
        margin="normal"
        value={formData.email}
        onChange={handleChange}
        disabled={isLoading}
        required
        sx={{ mb: 2 }}
      />
      <TextField
        label="Пароль"
        type="password"
        name="password"
        fullWidth
        margin="normal"
        value={formData.password}
        onChange={handleChange}
        disabled={isLoading}
        required
        sx={{ mb: 2 }}
        helperText="Минимум 6 символов, 1 цифра и 1 специальный символ"
        inputProps={{
          pattern: '^(?=.*[0-9])(?=.*[!@#$%^&*]).{6,}$',
          minLength: 6,
        }}
      />
      <TextField
        label="Подтвердите пароль"
        type="password"
        name="confirmPassword"
        fullWidth
        margin="normal"
        value={formData.confirmPassword}
        onChange={handleChange}
        disabled={isLoading}
        required
        sx={{ mb: 3 }}
      />

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={isLoading}
        sx={{ py: 1.5 }}
      >
        {isLoading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          'Зарегистрироваться'
        )}
      </Button>
    </Box>
  );
};

export default RegisterForm;
