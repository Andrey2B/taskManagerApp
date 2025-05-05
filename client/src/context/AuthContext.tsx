import React, { createContext, useContext, useState } from 'react';
import { User } from '../types/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    typeof window !== 'undefined' ? localStorage.getItem('token') : null
  );

  const login = (userData: User) => {
    setUser(userData);
    setToken(userData.token); // Сохраняем токен
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', userData.token);
      localStorage.setItem('user', JSON.stringify(userData)); // Сохраняем данные пользователя
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null); // Очищаем токен
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  const isAuthenticated = token !== null && user !== null; // Проверка авторизации

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        token,
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
