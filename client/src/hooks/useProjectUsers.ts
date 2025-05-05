//Выдаст мне участников текущего проекта, их роли
import { useEffect, useState } from "react";
import axios from "axios";

// Определяем тип для пользователя
interface User {
    id: string;
    name: string;
    role: string;
    avatar: string;
  }

export const useProjectUsers = (projectId: string) => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    axios
      .get<User[]>(`/api/projects/${projectId}/users`)
      .then((res) => setUsers(res.data))
      .catch((error) => {
        // Обработать ошибку, если нужно
        console.error("Ошибка при загрузке пользователей:", error);
      });
  }, [projectId]);

  return users;
};
