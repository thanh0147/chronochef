from fastapi import APIRouter, HTTPException, Depends
from app.schemas import QuizAnswers, QuizResult
from app.utils.chronotype import calculate_chronotype
from app.database import supabase

router = APIRouter(prefix="/quiz", tags=["Quiz"])

@router.post("/submit", response_model=QuizResult)
def submit_quiz(answers: QuizAnswers, user_id: str):
    """
    User nộp câu trả lời -> Server tính toán Chronotype -> Lưu vào DB
    """
    try:
        # 1. Tính toán Chronotype dựa trên câu trả lời
        chrono_name = calculate_chronotype(answers.dict())
        
        # 2. Lấy ID của Chronotype từ database
        chrono_data = supabase.table("chronotypes").select("id, description").eq("name", chrono_name).execute()
        if not chrono_data.data:
            raise HTTPException(status_code=404, detail="Chronotype not found in DB")
            
        chrono_id = chrono_data.data[0]['id']
        description = chrono_data.data[0]['description']
        
        # 3. Cập nhật chronotype_id cho User
        supabase.table("users").update({"chronotype_id": chrono_id}).eq("id", user_id).execute()
        
        return QuizResult(
            chronotype_name=chrono_name,
            description=description
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))