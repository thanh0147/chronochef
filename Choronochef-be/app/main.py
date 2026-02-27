from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import user, quiz, tracking
app = FastAPI(
    title="ChronoFit API",
    description="Backend API cho ứng dụng ChronoFit - Dinh dưỡng theo nhịp sinh học",
    version="1.0.0"
)

# Cấu hình CORS để Frontend (React) có thể gọi API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Trong thực tế nên đổi thành URL của Frontend (vd: http://localhost:3000)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Đăng ký các Routers
app.include_router(user.router)
app.include_router(quiz.router)
app.include_router(tracking.router)
@app.get("/")
def read_root():
    return {"message": "Welcome to ChronoFit API"}