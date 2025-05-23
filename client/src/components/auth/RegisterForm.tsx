import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  Box, 
  Typography, 
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent<string>) => {
    const { name, value } = e.target as HTMLInputElement | { name?: string; value: unknown };

    // Проверяем, что name определено и является строкой
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
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка регистрации';
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
          pattern: "^(?=.*[0-9])(?=.*[!@#$%^&*]).{6,}$", 
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
      {/*
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Роль</InputLabel>
        <Select
          name="role"
          value={formData.role}
          onChange={handleChange}
          label="Роль"
          disabled={isLoading}
        >
          <MenuItem value="user">Пользователь</MenuItem>
          <MenuItem value="manager">Менеджер</MenuItem>
          <MenuItem value="admin">Администратор</MenuItem>
        </Select>
      </FormControl>*/}
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      <Button type="submit" variant="contained" fullWidth disabled={isLoading} sx={{ py: 1.5 }}>
        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Зарегистрироваться'}
      </Button>
    </Box>
  );
};

export default RegisterForm;
