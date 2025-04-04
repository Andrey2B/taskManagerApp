export const ROUTES = {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    DASHBOARD: '/',
    PROJECTS: '/projects',
    PROJECT: (id: string) => `/projects/${id}`,
    TASKS: '/tasks',
    TASK: (id: string) => `/tasks/${id}`,
    CALENDAR: '/calendar',
    NOTIFICATIONS: '/notifications',
    SETTINGS: '/settings',
  };