from fastapi import APIRouter, File, UploadFile
from fastapi.responses import JSONResponse

router = APIRouter()

@router.post("/upload-avatar/")
async def upload_avatar(avatar: UploadFile = File(...)):
    try:
        # Сохраняем файл на сервере или в нужном месте
        file_location = f"avatars/{avatar.filename}"
        with open(file_location, "wb") as file:
            file.write(await avatar.read())
        
        return {"url": f"/avatars/{avatar.filename}"}
    except Exception as e:
        return JSONResponse(status_code=400, content={"message": f"Ошибка: {str(e)}"})
