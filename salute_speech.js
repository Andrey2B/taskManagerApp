// Файл: /voice/salute_speech.js

/*
  Клиент: запись через AudioWorkletNode и отправка raw PCM 16-bit моно 16 kHz
  - Исправлена деприкация ScriptProcessorNode
  - Защита от ошибки toLowerCase
*/

let audioContext;

async function startRecording() {
  audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });

  // Динамически создаём AudioWorkletProcessor
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
  await audioContext.audioWorklet.addModule(moduleURL);

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const source = audioContext.createMediaStreamSource(stream);
  const recorderNode = new AudioWorkletNode(audioContext, 'recorder-processor');

  const audioChunks = [];
  recorderNode.port.onmessage = e => {
    audioChunks.push(new Float32Array(e.data));
  };

  source.connect(recorderNode);
  recorderNode.connect(audioContext.destination);

  // Останавливаем через 5 секунд
  setTimeout(async () => {
    recorderNode.disconnect();
    source.disconnect();
    stream.getTracks().forEach(t => t.stop());

    const samples = flatten(audioChunks);
    const pcmBlob = encodePCM(samples);
    await sendAudio(pcmBlob);

    audioContext.close();
  }, 5000);
}

async function sendAudio(pcmBlob) {
  const formData = new FormData();
  formData.append('audio', pcmBlob, 'rec.pcm');
  const resp = await fetch('https://xn--b1agjhe8aq.xn--p1ai:3000/voice-to-text', { method: 'POST', body: formData });
  const json = await resp.json();
  const txt = (json.text || '').toString().toLowerCase();
  if (txt) handleVoiceCommand(txt);
}

function flatten(chunks) {
  let len = 0;
  for (const c of chunks) len += c.length;
  const result = new Float32Array(len);
  let offset = 0;
  for (const c of chunks) {
    result.set(c, offset);
    offset += c.length;
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

function handleVoiceCommand(command) {
  console.log('Распознано:', command);
  if (command.includes('следующий слайд.,')) document.querySelector('.progress-item:nth-child(2)')?.click();
  else if (command.includes('категория один.,')) document.querySelectorAll('.category')[0]?.click();
  else if (command.includes('категория два.,')) document.querySelectorAll('.category')[1]?.click();
  else if (command.includes('назад.,')) history.back();
  else if (command.includes('обновить.,')) location.reload();
  else if (command.includes('профиль.,')) document.getElementById('profile-button')?.click();
  else if (command.includes('каталог.,')) document.getElementById('voice_katalog')?.click();
  else if (command.includes('корзина.,')) document.getElementById('voice_cart')?.click();
  else alert('Команда не распознана: ' + command);
}

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.createElement('button');
  btn.textContent = '🎤 Голос';
  Object.assign(btn.style, { position:'fixed', bottom:'20px', right:'20px', zIndex:9999 });
  btn.onclick = startRecording;
  document.body.appendChild(btn);
});


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
