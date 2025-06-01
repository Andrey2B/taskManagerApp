// Файл: /voice/salute_speech_handler.js

const fs = require('fs');
const https = require('https');
const multer = require('multer');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const upload = multer({ dest: 'uploads/' });

// === ВАШИ ДАННЫЕ ===
const BASIC_AUTH_KEY = 'Basic N2U5MzY3MDktMTIwYi00OGIyLWFlMTAtYmEwYjZlMDI4MTI4OmNjMzA2ZDM1LWI0NGMtNGFlMy04ODExLWUwNzU5ZjA1NmY1NQ==';
const OAUTH_URL    = 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth';
const RECOG_URL    = 'https://smartspeech.sber.ru/rest/v1/speech:recognize';
const OAUTH_SCOPE  = 'scope=SALUTE_SPEECH_PERS';
// ===================

let cachedToken    = null;
let tokenExpiresAt = 0;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function getAccessToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt) return cachedToken;

  const rqUid = uuidv4();
  const resp = await axios.post(
    OAUTH_URL,
    OAUTH_SCOPE,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept':        'application/json',
        'RqUID':         rqUid,
        'Authorization': BASIC_AUTH_KEY
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      validateStatus: () => true
    }
  );
  if (resp.status !== 200 || !resp.data.access_token) {
    console.error('OAuth error:', resp.status, resp.data);
    throw new Error('OAuth token failed');
  }
  cachedToken = resp.data.access_token;
  tokenExpiresAt = now + resp.data.expires_in * 1000 - 5000;
  return cachedToken;
}

function registerSaluteRoute(app) {
  app.post('/voice-to-text', upload.single('audio'), async (req, res) => {
    try {
      const token = await getAccessToken();
      const audioData = fs.readFileSync(req.file.path);
      const mime = req.file.mimetype || 'audio/wav';

      const recog = await axios.post(
        RECOG_URL,
        audioData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type':  mime
          },
          httpsAgent: new https.Agent({ rejectUnauthorized: false }),
          responseType: 'json',
          validateStatus: () => true
        }
      );
      fs.unlinkSync(req.file.path);

      if (recog.status !== 200 || !recog.data.result) {
        console.error('ASR error:', recog.status, recog.data);
        return res.status(500).json({ error: 'ASR failed', details: recog.data });
      }
      res.json({ text: recog.data.result });

    } catch (err) {
      console.error('Voice handler error:', err);
      res.status(500).json({ error: 'Voice recognition error' });
    }
  });
}

module.exports = registerSaluteRoute;
