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
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });

  // Код для загрузки worklet через fetch
  const workletCode = `
    class RecorderProcessor extends AudioWorkletProcessor {
      process(inputs) {
        const input = inputs[0];
        if (input.length > 0) this.port.postMessage(input[0]);
        return true;
      }
    }
    registerProcessor('recorder-processor', RecorderProcessor);
  `;
  
  const blob = new Blob([workletCode], { type: 'application/javascript' });
  const moduleURL = URL.createObjectURL(blob);

  try {
    // Загружаем модуль
    await audioContext.audioWorklet.addModule(moduleURL);
  } catch (error) {
    console.error("Error loading AudioWorklet: ", error);
    setVoiceCommand('Error loading AudioWorklet');
    return;
  }

  // Далее ваша логика записи и обработки аудио
};



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

  const encodePCM = (samples: Float32Array) => {
    const buffer = new ArrayBuffer(samples.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < samples.length; i++) {
      let s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    return new Blob([view], { type: 'audio/x-pcm;bit=16;rate=16000' });
  };

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
    } catch (error) {
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
