import { ProjectRole } from "./project";

export interface User {
    id: string;                // Уникальный идентификатор пользователя
    name: string;              // Имя пользователя
    email: string;             // Email пользователя
    role?: ProjectRole;        // Роль пользователя в проекте (опционально)
    avatar?: string;           // Аватар пользователя (опционально)
    createdAt?: string;        // Дата создания пользователя (опционально)
    updatedAt?: string;        // Дата обновления пользователя (опционально)
    token: string;             // Токен доступа пользователя
}
  
export interface LoginResponse {
    token: string;               // основной access-токен
    refreshToken?: string;       // рефреш-токен для продления сессии
    expiresIn: number;           // время жизни токена в секундах или миллисекундах
    user: User;                  // информация о пользователе
    permissions?: string[];      // список прав пользователя (опционально)
    message?: string;            // например, "Добро пожаловать"
  }

interface RegisterData {
    name: string;
    email: string;
    password: string;
  }
  
export type UserRole = 'admin' | 'manager' | 'member';
  
export interface AuthResponse {
    token: string;
    user: User;
  }
  
  export interface LoginCredentials {
    email: string;
    password: string;
  }

  interface LoginData {
    email: string;
    password: string;
  }


export const getUserName = (user: User | string) =>
    typeof user === 'string' ? 'Неизвестный пользователь' : user.name;

  export interface RegisterFormProps {
    onSuccess?: () => void; // Колбэк при успешной регистрации
    onError?: (error: string) => void; // Колбэк при ошибке
  }