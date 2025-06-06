import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Typography } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import { Project } from '../types/project';

type VoiceButtonProps = {
  projects: Project[];
};

const VoiceButton: React.FC<VoiceButtonProps> = ({ projects }) => {
  const navigate = useNavigate();
  const [voiceCommand, setVoiceCommand] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const handleVoiceCommand = async (command: string) => {
    const token = localStorage.getItem('token');
    const isAuth = Boolean(token);

    const cleaned = command.trim().toLowerCase().replace(/[.,!?;:]/g, '');
    setVoiceCommand(cleaned);

    if (!isAuth) {
      setVoiceCommand('Пользователь не авторизован');
      return;
    }

    if (cleaned.includes('проекты')) {
      navigate('/projects');
    } 
    else if (cleaned.includes('уведомления')) {
      navigate('/notifications');
    }
    else if (cleaned.includes('главная')) {
      navigate('/');
    }
    else if (cleaned.includes('назад')) {
      navigate(-1);
    }
    else if (cleaned.includes('обновить')) {
      window.location.reload();
    }
    else if (cleaned.includes('настройки')) {
      navigate('/settings');
    }
    else if (cleaned.includes('выход') || cleaned.includes('выйти')) {
      localStorage.removeItem('token');
      navigate('/login');
      setVoiceCommand('Вы вышли из системы');
    }
    else if (cleaned.includes('создать проект')) {
      document.dispatchEvent(new CustomEvent('openCreateProjectModal'));
    }
    else if (cleaned.startsWith('открыть проект ')) {
      const projectName = cleaned.replace('открыть проект ', '').trim();

      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/projects/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) throw new Error('Не удалось получить список проектов');

        const projectsList = await response.json();
        const project = projectsList.find((p: { name: string; }) => p.name.toLowerCase() === projectName.toLowerCase());

        if (project) {
          navigate(`/projects/${project.id}`);
        } else {
          setVoiceCommand(`Проект с названием "${projectName}" не найден`);
        }
      } catch (error: any) {
        setVoiceCommand(`Ошибка при поиске проекта: ${error.message}`);
      }

      return;
    }
    else if (cleaned.includes('создать')) {
      document.dispatchEvent(new CustomEvent('openCreateNewProjectModal'));
    }
    else if (cleaned === 'создай задачу' || cleaned === 'создать задачу') {
      if (projects.length === 0) {
        setVoiceCommand('Список проектов пуст или еще загружается, невозможно создать задачу');
        return;
      }
      const projectId = projects[0].id;
      console.log('IdProject:', projectId);
      navigate(`/projects/${projectId}/new-task`);
      return;
    }
    else {
      console.log('Команда не распознана:', command);
    }
  };


  const flatten = (chunks: Float32Array[]) => {
    const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
    const result = new Float32Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
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
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/voice/recognize/`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      let commandText = '';
      if (Array.isArray(result)) {
        commandText = result[0] || '';
      } else if (typeof result === 'object' && result.text) {
        commandText = result.text;
      } else if (typeof result === 'string') {
        commandText = result;
      }

      handleVoiceCommand(commandText);
    } catch (error: any) {
      setVoiceCommand('Ошибка распознавания');
    }
  };

  const startVoiceRecognition = async () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: 16000,
    });

    if (!('AudioWorklet' in window)) {
      setVoiceCommand('AudioWorklet не поддерживается в этом браузере');
      return;
    }

    try {
      setIsRecording(true);
      await audioContext.audioWorklet.addModule('/salute_speech.js');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = audioContext.createMediaStreamSource(stream);
      const recorderNode = new AudioWorkletNode(audioContext, 'recorder-processor');
      
      const audioChunks: Float32Array[] = [];
      recorderNode.port.onmessage = (e) => {
        audioChunks.push(new Float32Array(e.data));
      };

      source.connect(recorderNode);
      recorderNode.connect(audioContext.destination);

      setTimeout(async () => {
        recorderNode.disconnect();
        source.disconnect();
        stream.getTracks().forEach((t) => t.stop());

        const samples = flatten(audioChunks);
        const pcmBlob = encodePCM(samples);
        await sendAudioToServer(pcmBlob);

        audioContext.close();
        setIsRecording(false);
      }, 5000);
    } catch (error: any) {
      setVoiceCommand('Ошибка: ' + error.message);
      setIsRecording(false);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 9999,
          borderRadius: '50%',
          width: 56,
          height: 56,
          minWidth: 0,
          animation: isRecording ? 'pulse 1.5s infinite' : 'none',
          '@keyframes pulse': {
            '0%': { boxShadow: '0 0 0 0 rgba(63, 81, 181, 0.7)' },
            '70%': { boxShadow: '0 0 0 10px rgba(63, 81, 181, 0)' },
            '100%': { boxShadow: '0 0 0 0 rgba(63, 81, 181, 0)' }
          }
        }}
        onClick={startVoiceRecognition}
      >
        <MicIcon />
      </Button>

      {voiceCommand && (
        <Typography 
          variant="body1" 
          sx={{
            position: 'fixed',
            bottom: 90,
            right: 20,
            zIndex: 9999,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: 1,
            borderRadius: 1
          }}
        >
          {voiceCommand}
        </Typography>
      )}
    </>
  );
};

export default VoiceButton;