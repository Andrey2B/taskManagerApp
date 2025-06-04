import uuid
from datetime import datetime, timedelta
from fastapi import FastAPI, APIRouter, File, UploadFile, HTTPException
from pydantic import BaseModel
import httpx
import logging
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

    try:
        async with httpx.AsyncClient(verify=False) as client:
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
    except httpx.RequestError as e:
        print(f"[OAuth] Request error: {e}")
        raise HTTPException(status_code=500, detail="OAuth connection error")

    try:
        json_data = response.json()
    except Exception:
        print(f"[OAuth] Invalid JSON: {response.text}")
        raise HTTPException(status_code=500, detail="Invalid OAuth response")

    if response.status_code != 200 or 'access_token' not in json_data:
        print(f"[OAuth] Failed: {response.status_code} - {json_data}")
        raise HTTPException(status_code=500, detail="OAuth token failed")

    cached_token = json_data['access_token']
    expires_in = json_data.get('expires_in', 3600)
    token_expires_at = now + timedelta(seconds=expires_in - 5)
    return cached_token


class VoiceResponse(BaseModel):
    text: str


@router.post("/recognize/", response_model=VoiceResponse)
async def voice_recognize(file: UploadFile = File(...)):
    try:
        token = await get_access_token()
        audio_data = await file.read()

        content_type = "audio/x-pcm;bit=16;rate=16000"

        async with httpx.AsyncClient(verify=False) as client:
            response = await client.post(
                RECOG_URL,
                data=audio_data,
                headers={
                    'Authorization': f'Bearer {token}',
                    'Content-Type': content_type
                },
                timeout=30
            )

        json_data = response.json()
        
        # Обрабатываем разные форматы ответа от Sber SpeechKit
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="ASR failed")

        result = ""
        if isinstance(json_data, list):
            # Если ответ - массив, соединяем элементы
            result = ' '.join(str(item) for item in json_data if item)
        elif isinstance(json_data, dict) and 'result' in json_data:
            # Если ответ - объект с полем result
            result = json_data['result']
            if isinstance(result, list):
                result = ' '.join(str(item) for item in result if item)
        elif isinstance(json_data, str):
            result = json_data
        
        # Очищаем результат от лишних символов
        result = result.strip().replace('.', '')
        print(f"Final result: {result}")
        
        return VoiceResponse(text=result)

    except Exception as e:
        print(f"[Voice Handler] Error: {e}")
        raise HTTPException(status_code=500, detail="Voice recognition error")

