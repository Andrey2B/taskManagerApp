// src/pages/SettingsPage.tsx
import React, { useState } from 'react';
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
  IconButton
} from '@mui/material';
import {
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Language as LanguageIcon,
  Logout as LogoutIcon,
  Edit as EditIcon,
  Save as SaveIcon
} from '@mui/icons-material';

// Типы для TypeScript
type TabPanelProps = {
  children?: React.ReactNode;
  index: number;
  value: number;
};

type Language = {
  code: string;
  name: string;
};

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
};

const languages: Language[] = [
  { code: 'en', name: 'English' },
  { code: 'ru', name: 'Русский' },
  { code: 'es', name: 'Español' },
];

export const SettingsPage = () => {
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
  const [selectedLanguage, setSelectedLanguage] = useState('ru');
  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    passwordChanged: new Date(2023, 5, 15),
  });

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (name: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setNotifications(prev => ({ ...prev, [name]: e.target.checked }));
  };

  const handleSaveProfile = () => {
    setEditMode(false);
    // Здесь будет логика сохранения на сервер
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Настройки
      </Typography>

      <Paper sx={{ display: 'flex', minHeight: '60vh' }}>
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={value}
          onChange={handleChange}
          sx={{ borderRight: 1, borderColor: 'divider', minWidth: 200 }}
        >
          <Tab label="Профиль" icon={<PersonIcon />} iconPosition="start" />
          <Tab label="Уведомления" icon={<NotificationsIcon />} iconPosition="start" />
          <Tab label="Безопасность" icon={<SecurityIcon />} iconPosition="start" />
          <Tab label="Язык" icon={<LanguageIcon />} iconPosition="start" />
        </Tabs>

        <Box sx={{ flexGrow: 1 }}>
          {/* Панель профиля */}
          <TabPanel value={value} index={0}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5">Профиль</Typography>
              {editMode ? (
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveProfile}
                >
                  Сохранить
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setEditMode(true)}
                >
                  Редактировать
                </Button>
              )}
            </Box>

            <Box display="flex" alignItems="center" mb={4}>
              <Avatar
                src={profile.avatar}
                sx={{ width: 80, height: 80, mr: 3 }}
              />
              {editMode && (
                <Button variant="outlined" size="small">
                  Изменить фото
                </Button>
              )}
            </Box>

            <Box component="form" sx={{ maxWidth: 500 }}>
              <TextField
                fullWidth
                label="Имя"
                name="name"
                value={profile.name}
                onChange={handleProfileChange}
                margin="normal"
                disabled={!editMode}
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={profile.email}
                onChange={handleProfileChange}
                margin="normal"
                disabled={!editMode}
              />
            </Box>
          </TabPanel>

          {/* Панель уведомлений */}
          <TabPanel value={value} index={1}>
            <Typography variant="h5" gutterBottom>
              Настройки уведомлений
            </Typography>
            
            <List>
              <ListItem>
                <ListItemText
                  primary="Email уведомления"
                  secondary="Получать важные уведомления на email"
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
                  primary="Push уведомления"
                  secondary="Получать уведомления в браузере"
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
                  primary="Звуковые уведомления"
                  secondary="Проигрывать звук при получении уведомлений"
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

          {/* Панель безопасности */}
          <TabPanel value={value} index={2}>
            <Typography variant="h5" gutterBottom>
              Безопасность
            </Typography>
            
            <List>
              <ListItem>
                <ListItemText
                  primary="Двухфакторная аутентификация"
                  secondary="Дополнительная защита вашего аккаунта"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={security.twoFactorAuth}
                    onChange={() => setSecurity(prev => ({
                      ...prev,
                      twoFactorAuth: !prev.twoFactorAuth
                    }))}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <Divider />
              
              <ListItem>
                <ListItemText
                  primary="Смена пароля"
                  secondary={`Последняя смена: ${security.passwordChanged.toLocaleDateString()}`}
                />
                <ListItemSecondaryAction>
                  <Button variant="outlined" size="small">
                    Изменить пароль
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </TabPanel>

          {/* Панель языка */}
          <TabPanel value={value} index={3}>
            <Typography variant="h5" gutterBottom>
              Язык интерфейса
            </Typography>
            
            <List>
              {languages.map((language) => (
                <React.Fragment key={language.code}>
                  <ListItem 
                    button 
                    onClick={() => setSelectedLanguage(language.code)}
                  >
                    <ListItemText primary={language.name} />
                    {selectedLanguage === language.code && (
                      <ListItemSecondaryAction>
                        <IconButton edge="end" disabled>
                          <LanguageIcon color="primary" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    )}
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </TabPanel>
        </Box>
      </Paper>

      <Box mt={4} display="flex" justifyContent="flex-end">
        <Button
          variant="outlined"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={() => console.log('Logout')} // Замените на реальный logout
        >
          Выйти из аккаунта
        </Button>
      </Box>
    </Container>
  );
};