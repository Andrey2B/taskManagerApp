import { LoginResponse } from "../../types/auth";

const API_URL = process.env.REACT_APP_API_URL;

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorDetails = await response.text();
      throw new Error(`Ошибка при входе: ${errorDetails || 'Неверный email или пароль'}`);
    }

    const data: LoginResponse = await response.json();
    if (!data.token) {
      throw new Error('Токен не был возвращен, вход не выполнен');
    }

    return data;
  } catch (error) {
    console.error('Ошибка при входе:', error);
    throw error;
  }
};