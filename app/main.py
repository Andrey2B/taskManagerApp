from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import users, tasks, roles, voice  # Импорт роутеров
from app.database import engine
from app import models

# Создание таблиц в базе данных
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Task Manager App",
    description="API для управления задачами и ролями",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Заменить на домен фронтенда в проде
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем роутеры
app.include_router(users.router)
app.include_router(tasks.router)
app.include_router(roles.router)
app.include_router(voice.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Task Manager App!"}
