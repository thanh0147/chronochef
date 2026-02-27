import { useState, useEffect, useRef} from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Utensils, Moon, Zap, Coffee, Brain, Sun, 
  Flame, Shield, LogOut, CheckCircle, Sparkles, RefreshCw
} from 'lucide-react';

const CHRONOTYPE_CONFIG = {
  lion: {
    name: "Sư tử (Lion)",
    gradient: `conic-gradient(from 0deg, #c7d2fe 0% 25%, #fef08a 25% 33.3%, #fbcfe8 33.3% 50%, #bbf7d0 50% 58.3%, #e9d5ff 58.3% 70.8%, #fed7aa 70.8% 91.6%, #c7d2fe 91.6% 100%)`,
    schedule: [
      { time: "22:00 - 06:00", act: "Ngủ say", icon: <Moon size={16}/>, color: "bg-indigo-200 text-indigo-800" },
      { time: "06:00 - 08:00", act: "Ăn sáng & Vận động", icon: <Sun size={16}/>, color: "bg-yellow-200 text-yellow-800" },
      { time: "08:00 - 12:00", act: "Làm việc năng suất cao", icon: <Zap size={16}/>, color: "bg-pink-200 text-pink-800" },
      { time: "12:00 - 14:00", act: "Ăn trưa & Chợp mắt", icon: <Utensils size={16}/>, color: "bg-green-200 text-green-800" },
      { time: "14:00 - 17:00", act: "Làm việc nhẹ nhàng", icon: <Brain size={16}/>, color: "bg-purple-200 text-purple-800" },
      { time: "17:00 - 22:00", act: "Ăn tối & Thư giãn", icon: <Coffee size={16}/>, color: "bg-orange-200 text-orange-800" }
    ]
  },
  bear: {
    name: "Gấu (Bear)",
    gradient: `conic-gradient(from 0deg, #c7d2fe 0% 29.1%, #fef08a 29.1% 37.5%, #fbcfe8 37.5% 54.1%, #bbf7d0 54.1% 62.5%, #e9d5ff 62.5% 75%, #fed7aa 75% 95.8%, #c7d2fe 95.8% 100%)`,
    schedule: [
      { time: "23:00 - 07:00", act: "Ngủ say", icon: <Moon size={16}/>, color: "bg-indigo-200 text-indigo-800" },
      { time: "07:00 - 09:00", act: "Thức dậy & Ăn sáng", icon: <Sun size={16}/>, color: "bg-yellow-200 text-yellow-800" },
      { time: "09:00 - 13:00", act: "Làm việc cường độ cao", icon: <Zap size={16}/>, color: "bg-pink-200 text-pink-800" },
      { time: "13:00 - 15:00", act: "Ăn trưa & Nghỉ ngơi", icon: <Utensils size={16}/>, color: "bg-green-200 text-green-800" },
      { time: "15:00 - 18:00", act: "Làm việc & Họp hành", icon: <Brain size={16}/>, color: "bg-purple-200 text-purple-800" },
      { time: "18:00 - 23:00", act: "Ăn tối & Giao lưu", icon: <Coffee size={16}/>, color: "bg-orange-200 text-orange-800" }
    ]
  },
  wolf: {
    name: "Sói (Wolf)",
    gradient: `conic-gradient(from 0deg, #c7d2fe 0% 33.3%, #fef08a 33.3% 41.6%, #e9d5ff 41.6% 54.1%, #fbcfe8 54.1% 75%, #fed7aa 75% 83.3%, #bbf7d0 83.3% 100%)`,
    schedule: [
      { time: "00:00 - 08:00", act: "Ngủ say", icon: <Moon size={16}/>, color: "bg-indigo-200 text-indigo-800" },
      { time: "08:00 - 10:00", act: "Khởi động ngày mới", icon: <Sun size={16}/>, color: "bg-yellow-200 text-yellow-800" },
      { time: "10:00 - 13:00", act: "Làm việc nhẹ nhàng", icon: <Brain size={16}/>, color: "bg-purple-200 text-purple-800" },
      { time: "13:00 - 18:00", act: "Đỉnh cao năng suất", icon: <Zap size={16}/>, color: "bg-pink-200 text-pink-800" },
      { time: "18:00 - 20:00", act: "Ăn tối & Nghỉ ngơi", icon: <Utensils size={16}/>, color: "bg-orange-200 text-orange-800" },
      { time: "20:00 - 00:00", act: "Thư giãn & Sáng tạo", icon: <Coffee size={16}/>, color: "bg-green-200 text-green-800" }
    ]
  },
  dolphin: {
    name: "Cá heo (Dolphin)",
    gradient: `conic-gradient(from 0deg, #c7d2fe 0% 27%, #fef08a 27% 35.4%, #fbcfe8 35.4% 62.5%, #e9d5ff 62.5% 75%, #fed7aa 75% 97.9%, #c7d2fe 97.9% 100%)`,
    schedule: [
      { time: "23:30 - 06:30", act: "Cố gắng ngủ sâu", icon: <Moon size={16}/>, color: "bg-indigo-200 text-indigo-800" },
      { time: "06:30 - 08:30", act: "Thể dục & Ăn sáng", icon: <Sun size={16}/>, color: "bg-yellow-200 text-yellow-800" },
      { time: "08:30 - 15:00", act: "Tập trung cao độ", icon: <Zap size={16}/>, color: "bg-pink-200 text-pink-800" },
      { time: "15:00 - 18:00", act: "Giảm tốc độ làm việc", icon: <Brain size={16}/>, color: "bg-purple-200 text-purple-800" },
      { time: "18:00 - 23:30", act: "Ăn tối & Xả stress", icon: <Coffee size={16}/>, color: "bg-orange-200 text-orange-800" }
    ]
  }
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [chronotype, setChronotype] = useState('bear'); 
  const [isLoading, setIsLoading] = useState(true);
  
  const [streakData, setStreakData] = useState({ current_streak: 0, freezes_available: 1 });
  const [time, setTime] = useState(new Date());
  const [meals, setMeals] = useState({ breakfast: false, lunch: false, dinner: false });

  // AI Widget State
  const [aiMessage, setAiMessage] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  // CHỐT CHẶN: Dùng useRef để đảm bảo API AI chỉ tự động chạy ĐÚNG 1 LẦN khi vừa vào trang
  const hasFetchedAiInitial = useRef(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      try {
        // 1. Tải Streak
        const streakRes = await api.get(`/tracking/streak/${user.id}`);
        if (streakRes.data) setStreakData(streakRes.data);

        // 2. Tải Đồng hồ sinh học
        const { data } = await supabase.from('profiles').select('chronotype').eq('id', user.id).maybeSingle(); 
        let activeType = 'bear';
        if (data && data.chronotype) {
          const validTypes = ['lion', 'bear', 'wolf', 'dolphin'];
          activeType = validTypes.includes(data.chronotype.toLowerCase()) ? data.chronotype.toLowerCase() : 'bear';
          setChronotype(activeType);
        }
        
        // 3. Lấy lời khuyên AI (CÓ BẢO VỆ)
        if (!hasFetchedAiInitial.current) {
          hasFetchedAiInitial.current = true; // Khóa chốt ngay lập tức
          fetchAIAdvice(activeType);
        }

      } catch (error) {
        console.error("Lỗi tải dữ liệu Dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, [user]);

  // HÀM GỌI API GROQ
  const fetchAIAdvice = async (type) => {
    setIsAiLoading(true);
    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
      if (!apiKey) {
        setAiMessage("Chưa cấu hình VITE_GROQ_API_KEY trong file .env");
        setIsAiLoading(false);
        return;
      }

      const currentHour = new Date().getHours();
      const currentMin = new Date().getMinutes();
      const typeName = CHRONOTYPE_CONFIG[type].name;

      const prompt = `1) GẤU (Bear) – “Theo mặt trời, nhịp phổ biến”

Đặc trưng: Dễ hòa nhịp giờ hành chính; sáng ổn, xế chiều xuống pin.
Giờ vàng làm việc: 10:00–14:00
Sau 15:00: làm việc nhẹ/ít căng não
Ngủ – dậy gợi ý: 22:00–23:00 / 06:00–07:00
Điểm yếu: ngủ muộn/thiếu ngủ → hôm sau “vật vờ”.
2) SÓI (Wolf) – “Cú đêm, bùng nổ buổi tối”
Đặc trưng: Ban ngày chậm, tối muộn mới vào guồng; hay sáng tạo.
Giờ vàng làm việc: 17:00 trở đi (đỉnh tối)
Giai đoạn khởi động: sáng làm việc nhẹ
Ngủ – dậy gợi ý: dậy 08:00–09:00, ngủ đủ 7–8h
Mẹo: tối hiệu suất cao nhưng nhớ vận động nhẹ trước ngủ.
3) SƯ TỬ (Lion) – “Dậy siêu sớm, mạnh đầu ngày”
Đặc trưng: 05:00–06:00 đã tỉnh; làm việc khó tốt nhất buổi sáng; chiều dễ hụt năng lượng.
Giờ vàng làm việc: 08:00–12:00
Chiều: việc nhẹ + thư giãn
Ngủ – dậy gợi ý: ngủ trước 22:00 / 05:00–06:00
Phong cách: hợp vai trò dẫn dắt, làm nhanh – gọn đầu ngày.
4) CÁ HEO (Dolphin) – “Ngủ nhạy, hay khó ngủ”
Đặc trưng: ngủ không sâu/khó ngủ; nhạy ánh sáng/tiếng ồn; không hợp giờ ngủ cứng nhắc.
Giờ vàng làm việc: 10:00–16:00
Sáng: làm việc nhẹ để “lên máy”
Ngủ – dậy gợi ý: cố lên giường trước 00:00, dậy ~08:00
Mẹo: ưu tiên “vệ sinh giấc ngủ” (phòng tối, yên, ít kích thích).Tôi có đồng hồ sinh học là ${typeName}. Bây giờ là ${currentHour}:${currentMin}. Hãy đóng vai một trợ lý sức khỏe, viết MỘT câu ngắn gọn (dưới 20 chữ), vui vẻ bằng tiếng Việt để khuyên tôi nên làm cái gì, ăn món gì hoặc nghỉ ngơi ra sao vào đúng giờ này. Đừng giải thích thêm.`;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant", // Model của Groq cực kỳ nhanh
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 60
        })
      });

      const data = await response.json();
      if (data.choices && data.choices[0]) {
        setAiMessage(data.choices[0].message.content.replace(/"/g, ''));
      }
    } catch (error) {
      console.error("Lỗi gọi AI Groq:", error);
      setAiMessage("Trạng thái tuyệt vời! Hãy tiếp tục duy trì nhé!");
    } finally {
      setIsAiLoading(false);
    }
  };

  // HÀM CLICK ĐIỂM DANH BỮA ĂN (CÓ GỌI API)
  const toggleMeal = async (mealId) => {
    const isChecked = !meals[mealId];
    setMeals(prev => ({ ...prev, [mealId]: isChecked }));
    
    // NẾU TICK VÀO (TRUE) THÌ GỌI API BACKEND ĐỂ GHI NHẬN & TĂNG CHUỖI
    if (isChecked) {
      try {
        // Gọi API lưu bữa ăn (Bạn cần đảm bảo backend hỗ trợ log_type này)
        await api.post(`/tracking/meal/${user.id}`, { log_type: mealId });
        
        // Load lại số điểm Streak mới nhất sau khi ăn
        const streakRes = await api.get(`/tracking/streak/${user.id}`);
        if (streakRes.data) {
          setStreakData(streakRes.data);
        }
      } catch (err) {
        console.error("Lỗi ghi nhận bữa ăn trên backend:", err);
      }
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const activeConfig = CHRONOTYPE_CONFIG[chronotype];

  if (isLoading) return <div className="min-h-screen bg-pink-50 flex items-center justify-center text-pink-400 font-bold">Đang phân tích dữ liệu sinh học...</div>;

  return (
    <div className="min-h-screen bg-pink-50/50 p-4 md:p-6 font-sans text-slate-800">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* HEADER BAR */}
        <div className="flex items-center justify-between bg-white px-6 py-4 rounded-3xl shadow-sm border border-pink-100">
          <div>
            <h1 className="text-2xl font-black text-pink-500 tracking-tight leading-none">ChronoFit</h1>
            <p className="text-sm font-medium text-slate-400 mt-1">{user?.email}</p>
          </div>
          <button onClick={handleSignOut} className="p-2 text-slate-400 hover:text-pink-500 hover:bg-pink-50 rounded-xl transition-all">
            <LogOut size={20} />
          </button>
        </div>

        {/* WIDGET MỚI: TRỢ LÝ AI GROQ */}
        <div className="bg-gradient-to-r from-pink-400 to-purple-400 rounded-3xl p-6 shadow-md shadow-pink-200 flex items-center justify-between text-white relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-10"><Brain size={120} /></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
              {isAiLoading ? <RefreshCw className="animate-spin text-white" /> : <Sparkles className="text-yellow-300" />}
            </div>
            <div>
              <p className="text-pink-100 text-sm font-semibold uppercase tracking-wider mb-1">AI Trợ lý phân tích</p>
              <p className="text-lg font-bold leading-tight">
                {isAiLoading ? "Đang suy nghĩ..." : aiMessage}
              </p>
            </div>
          </div>
          <button onClick={() => fetchAIAdvice(chronotype)} disabled={isAiLoading} className="relative z-10 p-2 bg-white/20 hover:bg-white/30 rounded-xl backdrop-blur-md transition-all">
            <RefreshCw size={20} className={isAiLoading ? "animate-spin" : ""} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* STREAK WIDGET */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-pink-100 flex items-center justify-between">
            <div>
              <h3 className="text-slate-500 font-medium mb-1">Chuỗi duy trì</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-slate-700">{streakData.current_streak}</span>
                <span className="text-slate-500 font-medium">ngày</span>
              </div>
            </div>
            <div className="flex gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${streakData.current_streak > 0 ? 'bg-orange-50 border-orange-100 text-orange-500' : 'bg-slate-50 border-slate-100 text-slate-300'}`}>
                <Flame size={24} />
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100 relative">
                <Shield className="text-blue-500" size={24} />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">
                  {streakData.freezes_available}
                </span>
              </div>
            </div>
          </div>

          {/* MEAL CHECK-IN WIDGET */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-pink-100">
            <h3 className="text-slate-500 font-medium mb-3">Điểm danh giờ ăn</h3>
            <div className="flex justify-between gap-2">
              {[
                { id: 'breakfast', label: 'Bữa sáng' },
                { id: 'lunch', label: 'Bữa trưa' },
                { id: 'dinner', label: 'Bữa tối' }
              ].map((meal) => (
                <button 
                  key={meal.id}
                  onClick={() => toggleMeal(meal.id)}
                  className={`flex-1 flex flex-col items-center p-2 rounded-2xl transition-all border ${
                    meals[meal.id] ? 'bg-pink-50 border-pink-200' : 'bg-slate-50 border-transparent hover:bg-slate-100'
                  }`}
                >
                  {meals[meal.id] ? <CheckCircle size={20} className="text-pink-500 mb-1" /> : <Utensils size={20} className="text-slate-400 mb-1" />}
                  <span className={`text-xs font-bold ${meals[meal.id] ? 'text-pink-600' : 'text-slate-500'}`}>{meal.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CLOCK SECTION (GIỮ NGUYÊN) */}
        <div className="bg-white rounded-3xl shadow-lg shadow-pink-100/40 p-6 md:p-8 flex flex-col lg:flex-row items-center gap-10 border border-pink-50">
          <div className="relative flex-shrink-0 w-64 h-64 md:w-80 md:h-80 rounded-full shadow-inner border-8 border-slate-50" style={{ background: activeConfig.gradient }}>
            <div className="absolute inset-10 bg-white rounded-full flex flex-col items-center justify-center shadow-md">
              <span className="text-xs md:text-sm font-semibold text-pink-400 tracking-wider uppercase mb-1">{activeConfig.name}</span>
              <span className="text-4xl md:text-5xl font-black text-slate-700 tabular-nums">
                {time.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <span className="absolute top-2 left-1/2 -translate-x-1/2 -translate-y-8 text-xs font-bold text-slate-400">00:00</span>
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 translate-y-8 text-xs font-bold text-slate-400">12:00</span>
            <span className="absolute right-2 top-1/2 translate-x-8 -translate-y-1/2 text-xs font-bold text-slate-400">06:00</span>
            <span className="absolute left-2 top-1/2 -translate-x-8 -translate-y-1/2 text-xs font-bold text-slate-400">18:00</span>
          </div>

          <div className="flex-1 w-full">
            <h2 className="text-xl font-bold text-slate-700 mb-5 flex items-center gap-2">
              <Zap className="text-pink-400 fill-pink-400" size={20} /> 
              Trạng thái lý tưởng trong ngày
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-3">
              {activeConfig.schedule.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 p-3 rounded-2xl bg-white border border-slate-100 hover:border-pink-200 transition-all">
                  <div className={`p-2.5 rounded-xl ${item.color}`}>
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-700">{item.time}</p>
                    <p className="text-sm font-medium text-slate-500">{item.act}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}