import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Container,
  Paper,
  Avatar,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import {
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Language as LanguageIcon,
  Edit as EditIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom'; // 👈 добавлено

type TabPanelProps = {
  children?: React.ReactNode;
  index: number;
  value: number;
};

const TabPanel = ({ children, value, index, ...other }: TabPanelProps) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`vertical-tabpanel-${index}`}
    aria-labelledby={`vertical-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

type Language = {
  code: string;
  name: string;
};

const languages: Language[] = [
  { code: 'en', name: 'English' },
  { code: 'ru', name: 'Русский' },
];

const uploadAvatar = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await fetch('/api/upload-avatar', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Не удалось загрузить фотографию');
  }

  const data = await response.json();
  return data.url;
};

const playNotificationSound = () => {
  const audio = new Audio('/notification-sound.mp3');
  audio.play().catch(() => {});
};

const sendNotification = (type: 'email' | 'push' | 'sounds') => {
  if (type === 'email') {
    alert('Отправлено Email уведомление');
  } else if (type === 'push') {
    alert('Отправлено Push уведомление');
  } else if (type === 'sounds') {
    playNotificationSound();
  }
};

export const SettingsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [value, setValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Иван Иванов',
    email: 'ivan@example.com',
    avatar: '/path/to/avatar.jpg',
  });
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sounds: true,
  });
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || 'ru');
  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    passwordChanged: new Date(2023, 5, 15),
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (name: keyof typeof notifications) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const updatedValue = e.target.checked;
    setNotifications((prev) => ({ ...prev, [name]: updatedValue }));
  
    console.log(`Настройка "${name}" изменена на`, updatedValue);
    sendNotification(name);
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setAvatarError(null);

    try {
      let avatarUrl = profile.avatar;
      if (avatarFile) {
        avatarUrl = await uploadAvatar(avatarFile);
      }

      setProfile((prev) => ({ ...prev, avatar: avatarUrl }));
      setAvatarFile(null);
      setEditMode(false);
    } catch (error: any) {
      setAvatarError(error.message || t('Не удалось загрузить фотографию'));
    }

    setLoading(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile((prev) => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
  });
  const [sessions, setSessions] = useState([
    { id: 1, device: 'Chrome на Windows', location: 'Москва', active: true },
    { id: 2, device: 'Safari на iPhone', location: 'Санкт-Петербург', active: false },
  ]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handlePasswordChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangePassword = () => {
    alert('Пароль изменён');
    setSecurity((prev) => ({ ...prev, passwordChanged: new Date() }));
    setPasswordData({ oldPassword: '', newPassword: '' });
  };

  const handleLogoutOtherSessions = () => {
    alert('Выход из всех других сессий');
    setSessions((prev) => prev.filter((s) => s.active));
  };

  const handleDeleteAccount = () => {
    alert('Аккаунт удалён');
    setDeleteDialogOpen(false);
    navigate('/goodbye');
  };

  useEffect(() => {
    i18n.changeLanguage(selectedLanguage);
  }, [selectedLanguage]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button variant="text" onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        ← {t('back') || 'Назад'}
      </Button>

      <Typography variant="h4" component="h1" gutterBottom>
        {t('settings')}
      </Typography>

      <Paper sx={{ display: 'flex', minHeight: '60vh' }}>
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={value}
          onChange={handleChange}
          sx={{ borderRight: 1, borderColor: 'divider', minWidth: 200 }}
        >
          <Tab label={t('profile')} icon={<PersonIcon />} iconPosition="start" />
          <Tab label={t('notifications')} icon={<NotificationsIcon />} iconPosition="start" />
          <Tab label={t('security')} icon={<SecurityIcon />} iconPosition="start" />
          <Tab label={t('language')} icon={<LanguageIcon />} iconPosition="start" />
        </Tabs>

        <Box sx={{ flexGrow: 1 }} key={selectedLanguage}>
          {/* Профиль */}
          <TabPanel value={value} index={0}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5">{t('profile')}</Typography>
              {editMode ? (
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveProfile}
                  disabled={loading}
                >
                  {loading ? t('saving') : t('save')}
                </Button>
              ) : (
                <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setEditMode(true)}>
                  {t('edit')}
                </Button>
              )}
            </Box>

            <Box display="flex" flexDirection="column" alignItems="flex-start" mb={4}>
              <Box display="flex" alignItems="center" mb={1}>
                <Avatar src={profile.avatar} sx={{ width: 80, height: 80, mr: 3 }} />
                {editMode && (
                  <>
                    <Button variant="outlined" size="small" onClick={() => fileInputRef.current?.click()}>
                      {t('changePhoto')}
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      onChange={handleAvatarChange}
                    />
                  </>
                )}
              </Box>
              {avatarError && (
                <Typography color="error" variant="body2" sx={{ ml: 10 }}>
                  {avatarError}
                </Typography>
              )}
            </Box>

            <Box component="form" sx={{ maxWidth: 500 }}>
              <TextField
                fullWidth
                label={t('name')}
                name="name"
                value={profile.name}
                onChange={handleProfileChange}
                margin="normal"
                disabled={!editMode}
              />
              <TextField
                fullWidth
                label={t('email')}
                name="email"
                value={profile.email}
                onChange={handleProfileChange}
                margin="normal"
                disabled={!editMode}
              />
            </Box>
          </TabPanel>

          {/* Уведомления */}
          <TabPanel value={value} index={1}>
            <Typography variant="h5" gutterBottom>
              {t('notificationSettings')}
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary={t('emailNotifications')}
                  secondary={t('emailNotificationsDescription')}
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={notifications.email}
                    onChange={handleNotificationChange('email')}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary={t('pushNotifications')}
                  secondary={t('pushNotificationsDescription')}
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={notifications.push}
                    onChange={handleNotificationChange('push')}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary={t('soundNotifications')}
                  secondary={t('soundNotificationsDescription')}
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={notifications.sounds}
                    onChange={handleNotificationChange('sounds')}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </TabPanel>

          {/* Безопасность */}
          <TabPanel value={value} index={2}>
            <Typography variant="h5" gutterBottom>
              {t('security')}
            </Typography>

            {/* 2FA */}
            <FormControlLabel
              control={
                <Switch
                  checked={security.twoFactorAuth}
                  onChange={() =>
                    setSecurity((prev) => {
                      const updated = !prev.twoFactorAuth;
                      console.log('2FA изменено:', updated);
                      return { ...prev, twoFactorAuth: updated };
                    })
                  }
                />
              }
              label={t('twoFactorAuth')}
            />
            <Typography variant="body2" color="textSecondary" mt={2}>
              {t('passwordChanged')}: {security.passwordChanged.toLocaleDateString()}
            </Typography>

            <Divider sx={{ my: 3 }} />

            {/* Смена пароля */}
            <Typography variant="h6" gutterBottom>
              {t('changePassword') || 'Сменить пароль'}
            </Typography>
            <TextField
              label={t('oldPassword') || 'Старый пароль'}
              type="password"
              name="oldPassword"
              fullWidth
              margin="normal"
              value={passwordData.oldPassword}
              onChange={handlePasswordChangeInput}
            />
            <TextField
              label={t('newPassword') || 'Новый пароль'}
              type="password"
              name="newPassword"
              fullWidth
              margin="normal"
              value={passwordData.newPassword}
              onChange={handlePasswordChangeInput}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleChangePassword}
              sx={{ mt: 2 }}
            >
              {t('savePassword') || 'Сохранить пароль'}
            </Button>

            <Divider sx={{ my: 3 }} />

            {/* Сессии */}
            <Typography variant="h6" gutterBottom>
              {t('activeSessions') || 'Активные сессии'}
            </Typography>
            <List dense>
              {sessions.map((session) => (
                <ListItem key={session.id}>
                  <ListItemText
                    primary={session.device}
                    secondary={session.location + (session.active ? ' • Текущая' : '')}
                  />
                </ListItem>
              ))}
            </List>
            <Button
              variant="outlined"
              color="warning"
              onClick={handleLogoutOtherSessions}
              sx={{ mt: 1 }}
            >
              {t('logoutOtherSessions') || 'Выйти из других сессий'}
            </Button>

            <Divider sx={{ my: 3 }} />

            {/* Удаление аккаунта */}
            <Typography variant="h6" gutterBottom color="error">
              {t('deleteAccount') || 'Удалить аккаунт'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {t('deleteAccountDesc') || 'Это действие нельзя отменить.'}
            </Typography>
            <Button
              variant="contained"
              color="error"
              onClick={() => setDeleteDialogOpen(true)}
              sx={{ mt: 2 }}
            >
              {t('confirmDeleteAccount') || 'Удалить аккаунт'}
            </Button>

            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
              <DialogTitle>{t('confirmDeleteTitle') || 'Удаление аккаунта'}</DialogTitle>
              <DialogContent>
                <Typography>
                  {t('confirmDeleteText') || 'Вы уверены, что хотите удалить аккаунт? Это действие необратимо.'}
                </Typography>
              </DialogContent>
            <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>
              {t('cancel') || 'Отмена'}
            </Button>
            <Button onClick={handleDeleteAccount} color="error">
              {t('delete') || 'Удалить'}
            </Button>
          </DialogActions>
        </Dialog>
      </TabPanel>

          {/* Язык */}
          <TabPanel value={value} index={3}>
            <Typography variant="h5" gutterBottom>
              {t('language')}
            </Typography>
            <List>
              {languages.map((lang) => (
                <ListItem
                  button
                  key={lang.code}
                  selected={selectedLanguage === lang.code}
                  onClick={() => setSelectedLanguage(lang.code)}
                >
                  <ListItemText primary={lang.name} />
                </ListItem>
              ))}
            </List>
          </TabPanel>
        </Box>
      </Paper>
    </Container>
  );
};
