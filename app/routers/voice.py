import uuid
from datetime import datetime, timedelta
from fastapi import FastAPI, APIRouter, File, UploadFile, HTTPException
from pydantic import BaseModel
import httpx

BASIC_AUTH_KEY = 'Basic N2U5MzY3MDktMTIwYi00OGIyLWFlMTAtYmEwYjZlMDI4MTI4OmNjMzA2ZDM1LWI0NGMtNGFlMy04ODExLWUwNzU5ZjA1NmY1NQ=='
OAUTH_URL = 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth'
RECOG_URL = 'https://smartspeech.sber.ru/rest/v1/speech:recognize'
OAUTH_SCOPE = 'scope=SALUTE_SPEECH_PERS'

router = APIRouter(prefix="/voice", tags=["voice"])

cached_token = None
token_expires_at = datetime.utcnow()

async def get_access_token():
    global cached_token, token_expires_at
    now = datetime.utcnow()
    if cached_token and now < token_expires_at:
        return cached_token

    async with httpx.AsyncClient() as client:
        rq_uid = str(uuid.uuid4())
        response = await client.post(
            OAUTH_URL,
            data=OAUTH_SCOPE,
            headers={
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                'RqUID': rq_uid,
                'Authorization': BASIC_AUTH_KEY
            },
            timeout=30
        )

        if response.status_code != 200 or 'access_token' not in response.json():
            print(f"OAuth error: {response.status_code} - {response.json()}")
            raise HTTPException(status_code=500, detail="OAuth token failed")

        cached_token = response.json()['access_token']
        expires_in = response.json()['expires_in']
        token_expires_at = now + timedelta(seconds=expires_in - 5)
        return cached_token

class VoiceResponse(BaseModel):
    text: str

# Исправлен путь на /recognize чтобы совпадать с фронтендом
@router.post("/recognize", response_model=VoiceResponse)
async def voice_recognize(file: UploadFile = File(...)):
    try:
        token = await get_access_token()
        audio_data = await file.read()

        async with httpx.AsyncClient() as client:
            response = await client.post(
                RECOG_URL,
                data=audio_data,
                headers={
                    'Authorization': f'Bearer {token}',
                    'Content-Type': file.content_type or 'audio/wav'
                },
                timeout=30
            )

        if response.status_code != 200 or 'result' not in response.json():
            print(f"ASR error: {response.status_code} - {response.json()}")
            raise HTTPException(status_code=500, detail="ASR failed")

        return VoiceResponse(text=response.json()['result'])

    except Exception as e:
        print(f"Voice handler error: {e}")
        raise HTTPException(status_code=500, detail="Voice recognition error")

app = FastAPI()
app.include_router(router)
