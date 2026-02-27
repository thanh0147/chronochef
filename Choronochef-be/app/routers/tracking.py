from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime, date
from app.database import supabase
import traceback  # Thư viện để in chi tiết dòng code gây lỗi

router = APIRouter(prefix="/tracking", tags=["Tracking"])

class MealLogRequest(BaseModel):
    log_type: str # 'first_meal' hoặc 'last_meal'

@router.post("/meal/{user_id}")
def log_meal(user_id: str, req: MealLogRequest):
    try:
        today_str = date.today().isoformat()
        now_iso = datetime.now().isoformat()
        
        # 1. Kiểm tra xem hôm nay user đã log gì chưa
        existing = supabase.table("daily_logs").select("*").eq("user_id", user_id).eq("log_date", today_str).execute()
        
        if not existing.data:
            # Lần log đầu tiên trong ngày -> Thêm mới
            data = {
                "user_id": user_id,
                "log_date": today_str,
                "first_meal_time": now_iso if req.log_type == 'first_meal' else None,
                "last_meal_time": now_iso if req.log_type == 'last_meal' else None
            }
            supabase.table("daily_logs").insert(data).execute()
            
            # Tăng chuỗi Streak
            update_streak(user_id, today_str)
            
        else:
            # Đã log rồi -> Cập nhật giờ ăn
            update_data = {f"{req.log_type}_time": now_iso}
            supabase.table("daily_logs").update(update_data).eq("id", existing.data[0]['id']).execute()
            
        return {"message": f"Đã ghi nhận {req.log_type} thành công!"}
        
    except Exception as e:
        # IN CHI TIẾT LỖI RA TERMINAL ĐỂ DEBUG
        print("\n====== LỖI BACKEND Ở HÀM LOG_MEAL ======")
        traceback.print_exc()
        print("========================================\n")
        raise HTTPException(status_code=500, detail=str(e))

def update_streak(user_id: str, today_str: str):
    try:
        # Lấy thông tin streak hiện tại
        streak_res = supabase.table("streaks").select("*").eq("user_id", user_id).execute()
        
        if not streak_res.data:
            # Nếu chưa có thì tạo mới
            supabase.table("streaks").insert({
                "user_id": user_id, 
                "current_streak": 1, 
                "longest_streak": 1,
                "last_log_date": today_str
            }).execute()
        else:
            streak = streak_res.data[0]
            
            # Chốt chặn an toàn: Tránh lỗi Null + 1
            current = streak.get('current_streak') or 0
            longest = streak.get('longest_streak') or 0
            
            if streak.get('last_log_date') != today_str:
                new_streak = current + 1
                supabase.table("streaks").update({
                    "current_streak": new_streak, 
                    "longest_streak": max(new_streak, longest),
                    "last_log_date": today_str
                }).eq("user_id", user_id).execute()
                
    except Exception as e:
        print("\n====== LỖI BACKEND Ở HÀM UPDATE_STREAK ======")
        traceback.print_exc()
        print("=============================================\n")
        raise e  # Ném lỗi ngược lên để hàm log_meal bắt được và in ra 500

@router.get("/streak/{user_id}")
def get_user_streak(user_id: str):
    try:
        res = supabase.table("streaks").select("current_streak, freezes_available").eq("user_id", user_id).execute()
        if res.data:
            return res.data[0]
        return {"current_streak": 0, "freezes_available": 1}
    except Exception as e:
        print("\n====== LỖI BACKEND Ở HÀM LẤY STREAK ======")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))