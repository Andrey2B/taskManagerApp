import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    fallbackLng: 'ru',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        translation: {
          settings: 'Settings',
          profile: 'Profile',
          notifications: 'Notifications',
          notificationSettings: 'Notification Settings',
          security: 'Security',
          language: 'Language',
          logout: 'Logout',
          name: 'Name',
          email: 'Email',
          edit: 'Edit',
          save: 'Save',
          changePhoto: 'Change Profile Photo',
          interfaceLanguage: 'Interface Language',
          emailNotifications: 'Email Notifications',
          emailNotificationsDescription: 'Receive notifications via email',
          pushNotifications: 'Push Notifications',
          pushNotificationsDescription: 'Receive notifications on your device',
          soundNotifications: 'Sound Notifications',
          soundNotificationsDescription: 'Play sound for notifications',
          twoFactor: 'Two-Factor Authentication',
          twoFactorDescription: 'Extra security for your account',
          changePassword: 'Change Password',
          lastChanged: 'Last changed',
          change: 'Change',
          PhotoFailed: 'Photo upload failed',

        },
      },
      ru: {
        translation: {
          settings: 'Настройки',
          profile: 'Профиль',
          notifications: 'Уведомления',
          notificationSettings: 'Настройки уведомлений',
          security: 'Безопасность',
          language: 'Язык',
          logout: 'Выйти из аккаунта',
          name: 'Имя',
          email: 'Email',
          edit: 'Редактировать',
          save: 'Сохранить',
          changePhoto: 'Сменить фото профиля',
          interfaceLanguage: 'Язык интерфейса',
          emailNotifications: 'Email уведомления',
          emailNotificationsDescription: 'Получать уведомления на Email',
          pushNotifications: 'Push уведомления',
          pushNotificationsDescription: 'Получать уведомления на устройство',
          soundNotifications: 'Звуковые уведомления',
          soundNotificationsDescription: 'Воспроизводить звук уведомлений',
          twoFactor: 'Двухфакторная аутентификация',
          twoFactorDescription: 'Дополнительная защита аккаунта',
          changePassword: 'Сменить пароль',
          lastChanged: 'Последнее изменение',
          change: 'Сменить',
          PhotoFailed: 'Не удалось загрузить фотографию',
    
        },
      },
    },
  });

export default i18n;
