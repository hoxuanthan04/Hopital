import React, { useState, useEffect } from 'react';
import LuotKhamService from '../../services/LuotKhamService';

interface Patient {
  name: string;
  age: number;
}

const GoiSo: React.FC = () => {
  const [queue, setQueue] = useState<any[]>([]);
  const [currentNumber, setCurrentNumber] = useState<string | number>("--");
  const [roomName] = useState<string>("Phòng Nội tổng quát"); // Có thể lấy từ ID phòng 11
  const currentRoomId = 11;

  const fetchQueue = async () => {
    try {
      const data = await LuotKhamService.getByPhong(currentRoomId);
      if (data && Array.isArray(data)) {
        setQueue(data);
        
        // Tìm bệnh nhân có trạng thái "Đang khám" để hiển thị số lớn
        const currentPatient = data.find((p: any) => p.trangthai === 'Đang khám');
        if (currentPatient) {
          // Lấy mã lượt khám (ví dụ lấy 3-4 số cuối) làm số thứ tự
          setCurrentNumber(currentPatient.maluotkham);
        } else {
          setCurrentNumber("--");
        }
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật màn hình gọi số:", error);
    }
  };

  useEffect(() => {
    fetchQueue();
    // Cập nhật nhanh hơn (mỗi 5-10 giây) để màn hình gọi số phản ứng kịp thời
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, [currentRoomId]);

  // Lọc danh sách bệnh nhân đang ĐỢI để hiển thị ở cột phải (tối đa 9 người)
  const waitingPatients = queue
    .filter((p: any) => p.trangthai === 'Chờ khám')
    .slice(0, 9);

  return (
    <div className="flex flex-col h-screen w-full bg-white overflow-hidden font-sans">
      {/* 1. Header: Tên bệnh viện - GIỮ NGUYÊN */}
      <header className="bg-[#0084FF] py-6 shadow-sm">
        <h1 className="text-center text-4xl md:text-6xl font-extrabold text-white uppercase tracking-tight">
          Bệnh viện đa khoa abc Hà Tĩnh
        </h1>
      </header>

      {/* 2. Body: Chia đôi màn hình - GIỮ NGUYÊN */}
      <main className="flex flex-1 overflow-hidden">
        
        {/* Cột trái: Hiển thị số lớn - DỮ LIỆU ĐỘNG */}
        <section className="w-1/2 flex items-center justify-center border-r border-gray-300">
          <div className="animate-pulse-slow">
            <span className="text-[25rem] md:text-[35rem] font-bold leading-none text-[#001A4D] select-none">
              {currentNumber}
            </span>
          </div>
        </section>

        {/* Cột phải: Danh sách bệnh nhân chờ - DỮ LIỆU ĐỘNG */}
        <section className="w-1/2 flex flex-col p-10 md:p-14 bg-white">
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-600 uppercase">
              Danh sách bệnh nhân chờ {roomName}
            </h2>
          </div>

          <div className="flex flex-col w-full space-y-4 mt-5">
            {waitingPatients.length > 0 ? (
              waitingPatients.map((patient, index) => (
                <div 
                  key={index} 
                  className="flex justify-between items-end border-b border-gray-100 pb-1"
                >
                  <span className="text-xl text-slate-500 font-thin">
                    {patient.hoten}
                  </span>
                  <span className="text-xl text-slate-400 font-thin">
                    {new Date().getFullYear() - patient.namsinh} tuổi
                  </span>
                </div>
              ))
            ) : (
              <div className="text-slate-300 text-2xl italic mt-10">
                Hiện không có bệnh nhân chờ...
              </div>
            )}
          </div>
        </section>
      </main>

      {/* 3. Footer: Slogan nghệ thuật - GIỮ NGUYÊN */}
      <footer className="bg-[#0084FF] py-6 border-t border-gray-300">
        <div className="text-center">
          <p className="slogan-text text-4xl md:text-6xl text-white">
            Tận tâm chăm sóc – Nâng tầm sức khỏe
          </p>
        </div>
      </footer>

      {/* Nhúng font chữ nghệ thuật qua CSS Scope - GIỮ NGUYÊN */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600&display=swap');
        
        .slogan-text {
          font-family: 'Dancing Script', cursive;
        }

        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }
      `}</style>
    </div>
  );
};

export default GoiSo;