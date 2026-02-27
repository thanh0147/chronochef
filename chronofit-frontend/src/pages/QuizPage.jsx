import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { Brain, Clock, Zap, Moon, Sun } from 'lucide-react';

// BỘ CÂU HỎI TRẮC NGHIỆM
const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "Vào ngày nghỉ (không dùng báo thức), bạn thường thức dậy lúc mấy giờ?",
    options: [
      { text: "Trước 6h30 sáng, rất tỉnh táo", type: "lion", icon: <Sun className="w-5 h-5 text-orange-500" /> },
      { text: "Khoảng 7h00 - 8h00 sáng", type: "bear", icon: <Clock className="w-5 h-5 text-amber-500" /> },
      { text: "Sau 9h00 sáng, rất khó dậy sớm", type: "wolf", icon: <Moon className="w-5 h-5 text-indigo-500" /> },
      { text: "Giờ giấc lộn xộn, hay tỉnh giấc giữa đêm", type: "dolphin", icon: <Brain className="w-5 h-5 text-cyan-500" /> }
    ]
  },
  {
    id: 2,
    question: "Bạn cảm thấy năng lượng làm việc dồi dào nhất vào lúc nào?",
    options: [
      { text: "Sáng sớm đến gần trưa", type: "lion" },
      { text: "Từ giữa buổi sáng đến đầu giờ chiều", type: "bear" },
      { text: "Từ chiều tối đến tận đêm khuya", type: "wolf" },
      { text: "Năng lượng lên xuống thất thường, hay bồn chồn", type: "dolphin" }
    ]
  },
  {
    id: 3,
    question: "Cách bạn chìm vào giấc ngủ thường như thế nào?",
    options: [
      { text: "Ngủ dễ dàng nhưng hay thức dậy sớm", type: "lion" },
      { text: "Ngủ sâu, ít khi bị tỉnh giấc", type: "bear" },
      { text: "Khó ngủ sớm, hay thức khuya nghịch điện thoại", type: "wolf" },
      { text: "Rất khó ngủ, ngủ rất nông, nhạy cảm với tiếng động", type: "dolphin" }
    ]
  }
];

export default function QuizPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Xử lý khi chọn một đáp án
  const handleSelectOption = (type) => {
    const newAnswers = [...answers, type];
    
    // Nếu chưa hết câu hỏi thì chuyển câu tiếp theo
    if (currentStep < QUIZ_QUESTIONS.length - 1) {
      setAnswers(newAnswers);
      setCurrentStep(currentStep + 1);
    } else {
      // Đã trả lời xong câu cuối -> Tính kết quả và lưu
      calculateAndSaveResult(newAnswers);
    }
  };

  // Hàm tính toán và lưu lên Database
  const calculateAndSaveResult = async (finalAnswers) => {
    setIsSubmitting(true);
    
    try {
      // 1. Đếm số lượng từng type trong mảng đáp án
      const counts = finalAnswers.reduce((acc, type) => {
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      // 2. Tìm type có số lượng nhiều nhất
      let resultChronotype = 'bear'; // Mặc định nếu hòa
      let maxCount = 0;
      for (const [type, count] of Object.entries(counts)) {
        if (count > maxCount) {
          maxCount = count;
          resultChronotype = type;
        }
      }

      console.log("Kết quả trắc nghiệm tính ra là:", resultChronotype);

      // 3. LƯU VÀO SUPABASE BẰNG UPSERT (Tự tạo nếu chưa có)
      if (user && user.id) {
        const { error } = await supabase
          .from('profiles')
          .upsert({ 
            id: user.id, 
            chronotype: resultChronotype 
          });

        if (error) {
          console.error("Lỗi lưu Supabase:", error);
          alert(`Lỗi khi lưu kết quả: ${error.message}`);
          setIsSubmitting(false);
          return; // Dừng lại, không chuyển trang nếu lỗi
        }
        
        console.log("Đã lưu thành công vào Supabase!");
      }

      // 4. Nếu mọi thứ thành công thì mới chuyển trang sang Dashboard
      navigate('/dashboard');

    } catch (error) {
      // Đây chính là khối catch bị thiếu ở code của bạn!
      console.error("Lỗi hệ thống:", error);
      alert("Đã xảy ra lỗi hệ thống, vui lòng thử lại!");
      setIsSubmitting(false);
    }
  };

  const question = QUIZ_QUESTIONS[currentStep];
  const progressPercent = ((currentStep) / QUIZ_QUESTIONS.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col pt-12 px-6">
      <div className="max-w-md mx-auto w-full">
        
        {/* THANH TIẾN ĐỘ */}
        <div className="mb-8">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-semibold text-indigo-500">Câu {currentStep + 1}/{QUIZ_QUESTIONS.length}</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
            <div 
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* NỘI DUNG CÂU HỎI */}
        <div className="mb-10 min-h-[100px]">
          <h2 className="text-2xl font-bold leading-tight">
            {question.question}
          </h2>
        </div>

        {/* CÁC ĐÁP ÁN */}
        <div className="space-y-3">
          {question.options.map((opt, index) => (
            <button
              key={index}
              disabled={isSubmitting}
              onClick={() => handleSelectOption(opt.type)}
              className="w-full flex items-center gap-4 p-4 text-left bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:border-indigo-500 hover:ring-1 hover:ring-indigo-500 transition-all disabled:opacity-50"
            >
              <div className="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                {opt.icon || <Zap className="w-5 h-5 text-slate-400" />}
              </div>
              <span className="font-medium text-slate-700 dark:text-slate-200">
                {opt.text}
              </span>
            </button>
          ))}
        </div>

        {/* HIỂN THỊ LOADING KHI LƯU KẾT QUẢ */}
        {isSubmitting && (
          <div className="mt-8 text-center text-sm font-medium text-indigo-500 flex items-center justify-center gap-2">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Đang phân tích đồng hồ sinh học của bạn...
          </div>
        )}

      </div>
    </div>
  );
}