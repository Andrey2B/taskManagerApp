import { useState } from 'react';
import { Project, ProjectMember, ProjectRole, ProjectUser } from '../types/project'
import { UserRole } from '../types/auth';
import { useProjects } from './useProjects';

export const useProjectRoles = () => {
  const { getProjectById } = useProjects();
  const [currentRole, setCurrentRole] = useState<ProjectRole | undefined>(undefined);

  const getUserRoleInProject = (userId: string, project: Project): ProjectRole | undefined => {
    const projectUser = project.members.find((user: ProjectMember) => {
      if (typeof user.user === 'string') {
        return user.user === userId;
      } else if (user.user && typeof user.user === 'object' && 'id' in user.user) {
        return user.user.id === userId;
      }
      return false;
    });

    // Возвращаем роль, если пользователь найден в проекте
    return projectUser ? projectUser.role : undefined;
  };

  const handleProjectLogin = (userId: string, projectId: string) => {
    const project = getProjectById(projectId);

    if (!project) {
      console.error('Проект не найден');
      return;
    }

    const role = getUserRoleInProject(userId, project);

    // Проверяем роль пользователя в проекте на основе типа ProjectRole
    if (role && (role === 'owner' || role === 'developer' || role === 'designer' || role === 'manager' || role === 'qa' || role === 'analyst')) {
       // Преобразуем UserRole в ProjectRole и устанавливаем роль в состояние
      setCurrentRole(role);  // Устанавливаем роль как ProjectRole
      } else {
        console.log('Пользователь не найден в этом проекте или роль несовместима');
      }
  };

  return {
    currentRole,
    handleProjectLogin,
  };
};
