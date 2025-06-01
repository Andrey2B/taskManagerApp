// global.d.ts или в начале вашего TypeScript-файла
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// Пример использования
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'en-US';
recognition.start();
recognition.onresult = (event) => {
  console.log('Speech recognition result:', event.results[0][0].transcript);
};
