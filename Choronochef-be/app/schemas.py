from pydantic import BaseModel
from typing import Optional

# Schema cho User Profile
class UserProfileResponse(BaseModel):
    id: str
    email: str
    chronotype_id: Optional[str] = None
    timezone: str

class UserProfileUpdate(BaseModel):
    timezone: str

# Schema cho Quiz
class QuizAnswers(BaseModel):
    morning_energy: int # Thang điểm 1-4
    sleep_depth: int    # Thang điểm 1-4
    focus_time: int     # Thang điểm 1-4
    
class QuizResult(BaseModel):
    chronotype_name: str
    description: str