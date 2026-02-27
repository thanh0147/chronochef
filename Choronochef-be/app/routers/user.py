from fastapi import APIRouter, HTTPException
from app.schemas import UserProfileResponse, UserProfileUpdate
from app.database import supabase

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/{user_id}", response_model=UserProfileResponse)
def get_user_profile(user_id: str):
    try:
        response = supabase.table("users").select("*").eq("id", user_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="User not found")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{user_id}", response_model=UserProfileResponse)
def update_user_profile(user_id: str, profile: UserProfileUpdate):
    try:
        response = supabase.table("users").update(profile.dict()).eq("id", user_id).execute()
        if not response.data:
            raise HTTPException(status_code=400, detail="Update failed")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))