export const getProjectUsers = async (projectId: string) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://127.0.0.1:8000/projects/${projectId}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error('Ошибка при загрузке участников проекта');
    return res.json(); // массив пользователей
  };
  