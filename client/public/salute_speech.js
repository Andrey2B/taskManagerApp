let audioContext;
class RecorderProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const input = inputs[0];
    if (input && input.length > 0) {
      const channelData = input[0];
      this.port.postMessage(channelData);
    }
    return true;
  }
}

registerProcessor('recorder-processor', RecorderProcessor);
async function startRecording() {
  if (!window.AudioContext && !window.webkitAudioContext) {
    alert("Ваш браузер не поддерживает AudioContext");
    return;
  }

  audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });

  // Код AudioWorkletProcessor с правильной сигнатурой process()
  const workletCode = `
    class RecorderProcessor extends AudioWorkletProcessor {
      process(inputs, outputs, parameters) {
        const input = inputs[0];
        if (input && input.length > 0) {
          const channelData = input[0];
          this.port.postMessage(channelData);
        }
        return true;
      }
    }
    registerProcessor('recorder-processor', RecorderProcessor);
  `;

  const blob = new Blob([workletCode], { type: 'application/javascript' });
  const moduleURL = URL.createObjectURL(blob);

  try {
    await audioContext.audioWorklet.addModule(moduleURL);
    console.log("AudioWorklet модуль успешно загружен");
  } catch (err) {
    console.error("Ошибка при загрузке AudioWorklet модуля:", err);
    alert("Ошибка загрузки голосового модуля. Проверьте безопасность страницы и HTTPS.");
    return;
  }

  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log("Доступ к микрофону получен");
  } catch (err) {
    alert("Доступ к микрофону запрещён или недоступен");
    return;
  }

  const source = audioContext.createMediaStreamSource(stream);
  const recorderNode = new AudioWorkletNode(audioContext, 'recorder-processor');

  const audioChunks = [];

  recorderNode.port.onmessage = e => {
    audioChunks.push(new Float32Array(e.data));
  };

  source.connect(recorderNode);
  recorderNode.connect(audioContext.destination);

  console.log("Начинается запись голоса...");

  setTimeout(async () => {
    recorderNode.disconnect();
    source.disconnect();
    stream.getTracks().forEach(t => t.stop());

    const samples = flatten(audioChunks);
    const pcmBlob = encodePCM(samples);

    try {
      await sendAudio(pcmBlob);
      console.log("Аудио успешно отправлено на сервер");
    } catch (err) {
      console.error("Ошибка при отправке аудио:", err);
    }

    await audioContext.close();
    console.log("AudioContext закрыт");
  }, 5000);
}

function flatten(chunks) {
  const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
  const result = new Float32Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}

function encodePCM(samples) {
  const buffer = new ArrayBuffer(samples.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < samples.length; i++) {
    let s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
  return new Blob([view], { type: 'audio/x-pcm;bit=16;rate=16000' });
}

async function sendAudio(pcmBlob) {
  const formData = new FormData();
  formData.append('audio', pcmBlob, 'rec.pcm');
  const resp = await fetch('https://127.0.0.1:8000/voice-to-text', {
    method: 'POST',
    body: formData
  });
  const json = await resp.json();
  const txt = (json.text || '').toString().toLowerCase();

  if (txt) handleVoiceCommand(txt);
}

function handleVoiceCommand(command) {
  console.log('Распознано:', command);

  if (command.includes('следующий слайд')) document.querySelector('.progress-item:nth-child(2)')?.click();
  else if (command.includes('категория один')) document.querySelectorAll('.category')[0]?.click();
  else if (command.includes('категория два')) document.querySelectorAll('.category')[1]?.click();
  else if (command.includes('назад')) window.history.back();
  else if (command.includes('обновить')) window.location.reload();
  else if (command.includes('профиль')) document.getElementById('profile-button')?.click();
  else if (command.includes('каталог')) document.getElementById('voice_katalog')?.click();
  else if (command.includes('корзина')) document.getElementById('voice_cart')?.click();
  else alert('Команда не распознана: ' + command);
}

// Добавляем кнопку, если есть DOM
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.createElement('button');
    btn.textContent = '🎤 Голос';
    Object.assign(btn.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 9999,
      padding: '10px 15px',
      fontSize: '18px',
      cursor: 'pointer'
    });
    btn.onclick = startRecording;
    document.body.appendChild(btn);
  });
}
