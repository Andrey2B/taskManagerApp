from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# URL базы данных
DATABASE_URL = "sqlite:///./app/task_manager.db"

# Создаем подключение к базе данных
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# Сессии для работы с БД
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Базовый класс для декларативных моделей
Base = declarative_base()

# Функция для создания всех таблиц в базе данных (если необходимо)
def create_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
