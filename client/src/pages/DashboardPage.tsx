import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Stack, Button } from '@mui/material';
import TaskCard from '../components/tasks/TaskCard';
import { Task } from '../types/task';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

const DashboardPage: React.FC = () => {
  const { token } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [voiceCommand, setVoiceCommand] = useState<string>(''); // Хранение голосовой команды

  useEffect(() => {
    if (!token) {
      setError('Вы не авторизованы');
      setLoading(false);
      return;
    }

    const fetchTasks = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get<Task[]>(`${API_URL}/tasks/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTasks(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Ошибка при загрузке задач');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [token]);

  // Функция для записи аудио и отправки его на сервер
  const startVoiceRecognition = async () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: 16000,
    });

    // Проверяем поддержку AudioWorklet до его использования
    if ('AudioWorklet' in window) {
      console.log('AudioWorklet поддерживается');
    } else {
      console.error('AudioWorklet не поддерживается в этом браузере');
      setVoiceCommand('AudioWorklet не поддерживается в этом браузере');
      return;
    }

    try {
      console.log('Пытаемся загрузить AudioWorklet...');

      // Убедитесь, что файл доступен в публичной папке (например, public/salute_speech.js)
      await audioContext.audioWorklet.addModule('/salute_speech.js'); // Путь к файлу
      console.log('AudioWorklet загружен.');
      console.log('AudioWorklet загружен1.');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('AudioWorklet загружен2.');
      const source = audioContext.createMediaStreamSource(stream);
      console.log('AudioWorklet загружен3.');
      const recorderNode = new AudioWorkletNode(audioContext, 'recorder-processor');
      console.log('AudioWorklet загружен.');
      
      const audioChunks: Float32Array[] = [];
      recorderNode.port.onmessage = (e) => {
        audioChunks.push(new Float32Array(e.data));
      };

      source.connect(recorderNode);
      recorderNode.connect(audioContext.destination);

      // Останавливаем через 5 секунд
      setTimeout(async () => {
        recorderNode.disconnect();
        source.disconnect();
        stream.getTracks().forEach((t) => t.stop());

        const samples = flatten(audioChunks);
        const pcmBlob = encodePCM(samples);
        await sendAudioToServer(pcmBlob);

        audioContext.close();
      }, 5000);
    
    } catch (error: any) {
      console.error('Ошибка при подключении к AudioWorklet:', error);
      setVoiceCommand('Ошибка при подключении к AudioWorklet: ' + error.message);
    }
  };

  // Функция для преобразования аудио в один массив
  const flatten = (chunks: Float32Array[]) => {
    let len = 0;
    for (const c of chunks) len += c.length;
    const result = new Float32Array(len);
    let offset = 0;
    for (const c of chunks) {
      result.set(c, offset);
      offset += c.length;
    }
    return result;
  };

  // Функция для кодирования аудио в формат PCM
  const encodePCM = (samples: Float32Array) => {
    const buffer = new ArrayBuffer(samples.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < samples.length; i++) {
      let s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    return new Blob([view], { type: 'audio/x-pcm;bit=16;rate=16000' });
  };

  // Отправка аудио на сервер для распознавания
  const sendAudioToServer = async (pcmBlob: Blob) => {
    const formData = new FormData();
    formData.append('file', pcmBlob, 'audio.pcm');

    try {
      const response = await fetch(`${API_URL}/voice/recognize/`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      setVoiceCommand(result.text || 'Команда не распознана');
    } catch (error: any) {
      console.error('Ошибка при распознавании:', error);
      setVoiceCommand('Ошибка при распознавании');
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Мои задачи из всех проектов
      </Typography>

      {loading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && tasks.length === 0 && (
        <Typography variant="body1">У вас пока нет задач.</Typography>
      )}

      {!loading && !error && tasks.length > 0 && (
        <Stack spacing={2} mt={2}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} readOnly />
          ))}
        </Stack>
      )}

      {/* Кнопка для начала записи */}
      <Button
        variant="contained"
        color="primary"
        sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999 }}
        onClick={startVoiceRecognition}
      >
        🎤 Голос
      </Button>

      {/* Показать распознанную команду */}
      <Typography variant="h6" sx={{ mt: 4 }}>
        Распознанная команда: {voiceCommand}
      </Typography>
    </Box>
  );
};

export default DashboardPage;
