from fastapi import APIRouter, File, UploadFile, HTTPException
from typing import Dict

from io import BytesIO

router = APIRouter(prefix="/voice", tags=["voice"])

# Секреты API для отправки данных на Sberbank API
BASIC_AUTH_KEY = 'Basic YOUR_BASIC_AUTH_KEY'
OAUTH_URL = 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth'
RECOG_URL = 'https://smartspeech.sber.ru/rest/v1/speech:recognize'

async def get_access_token():
    # Код для получения токена OAuth (аналогичный вашему JavaScript)
    # Верните access_token для использования в запросах
    pass

@router.post("/recognize/")
async def voice_to_text(file: UploadFile = File(...)):
    try:
        # Получение токена
        token = await get_access_token()

        # Получаем аудио как байты
        audio_data = await file.read()

        # Отправляем данные на сервис распознавания
        response = requests.post(
            RECOG_URL,
            headers={"Authorization": f"Bearer {token}"},
            data=audio_data,
            files={"file": audio_data},
        )

        # Обрабатываем ответ
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Speech recognition failed")

        # Распознанный текст
        result = response.json().get("result", "")
        return {"text": result}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Voice recognition error: {str(e)}")
