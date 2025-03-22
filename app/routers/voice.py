from fastapi import APIRouter

router = APIRouter(prefix="/voice", tags=["voice"])

@router.post("/create_task")
def create_task_from_voice(command: str):
    if "создай задачу" in command.lower():
        task_title = command.lower().split("создай задачу")[1].strip()
        return {"message": f"Задача '{task_title}' создана"}
    return {"message": "Команда не распознана"}