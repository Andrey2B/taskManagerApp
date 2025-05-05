import { createContext, useContext,  useState, ReactNode, useEffect } from 'react';

type ThemeContextType = {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
};

// Создаю контекст с начальным значением undefined
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface CustomThemeProviderProps {
  children: ReactNode;
}

// Провайдер для контекста
export function CustomThemeProvider({ children }: CustomThemeProviderProps)  {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');


// Загружаем сохраненную тему из localStorage при инициализации
useEffect(() => {
  const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
  if (savedTheme) {
    setTheme(savedTheme);   
  }
}, []);


  // Функция для переключения темы
  const toggleTheme = () => {
    const updatedTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(updatedTheme);
    localStorage.setItem('theme', updatedTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Хук для доступа к контексту
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a CustomThemeProvider');
  }
  return context;
};
