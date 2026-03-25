from fastapi import APIRouter
from pydantic import BaseModel
from services.llm_service import categorize_transaction

router = APIRouter()


class CategorizeRequest(BaseModel):
    description: str
    amount: float


@router.post("/categorize")
async def categorize(req: CategorizeRequest):
    result = await categorize_transaction(req.description, req.amount)
    return result
