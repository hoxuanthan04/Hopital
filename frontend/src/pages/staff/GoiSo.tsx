import React, { useCallback, useEffect, useState } from 'react';
import LuotKhamService from '../../services/LuotKhamService';
import PhongKhamService from '../../services/phongkham.service';

const MACHINE_STORAGE_KEY = 'tth_mamayphong';

type PhongRow = {
  maphong: number;
  tenphong?: string | null;
  tenchuyenkhoa?: string | null;
  mamayphong?: string | null;
};

type QueuePatient = {
  maluotkham: number;
  hoten?: string | null;
  namsinh?: number | null;
  trangthai?: string | null;
  /** Thứ tự gọi trong phòng (FIFO) do API trả về. */
  stt_trong_phong?: number | null;
};

function getResolvedMachineCode(): string | null {
  const fromQuery = new URLSearchParams(window.location.search).get('mamay');
  if (fromQuery && fromQuery.trim()) return fromQuery.trim();
  const fromStorage = localStorage.getItem(MACHINE_STORAGE_KEY);
  if (fromStorage && fromStorage.trim()) return fromStorage.trim();
  return null;
}

const GoiSo: React.FC = () => {
  const [room, setRoom] = useState<PhongRow | null>(null);
  const [roomError, setRoomError] = useState<string | null>(null);
  const [queue, setQueue] = useState<QueuePatient[]>([]);
  const [currentNumber, setCurrentNumber] = useState<string | number>('--');

  const resolveRoom = useCallback(async () => {
    const code = getResolvedMachineCode();
    if (!code) {
      setRoomError('Chưa cấu hình mã máy phòng (mamayphong) cho màn hình gọi số.');
      return;
    }
    try {
      const phong = (await PhongKhamService.getByMachineCode(code)) as PhongRow;
      if (!phong?.maphong) {
        setRoomError('Không xác định được phòng theo mã máy đã cấu hình.');
        return;
      }
      setRoom(phong);
      setRoomError(null);
    } catch (error) {
      console.error('Không tải được thông tin phòng cho màn gọi số:', error);
      setRoomError('Không tìm thấy phòng theo mã máy đã cấu hình.');
    }
  }, []);

  useEffect(() => {
    resolveRoom();
  }, [resolveRoom]);

  const fetchQueue = useCallback(async () => {
    if (!room?.maphong) return;
    try {
      const data = (await LuotKhamService.getByPhong(room.maphong)) as QueuePatient[];
      const list = Array.isArray(data) ? data : [];
      setQueue(list);

      const current = list.find((p) => (p.trangthai || '').trim() === 'Đang khám');
      if (current && current.stt_trong_phong != null) {
        setCurrentNumber(current.stt_trong_phong);
      } else {
        setCurrentNumber('--');
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật màn hình gọi số:', error);
    }
  }, [room?.maphong]);

  useEffect(() => {
    if (!room?.maphong) return;
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, [room?.maphong, fetchQueue]);

  const waitingPatients = queue
    .filter((p) => (p.trangthai || '').trim() === 'Chờ khám')
    .slice(0, 9);

  const roomName = room?.tenphong || 'Phòng khám';

  return (
    <div className="flex flex-col h-screen w-full bg-white overflow-hidden font-sans">
      <header className="bg-[#0084FF] py-6 shadow-sm">
        <h1 className="text-center text-4xl md:text-6xl font-extrabold text-white uppercase tracking-tight">
          Bệnh viện đa khoa abc Hà Tĩnh
        </h1>
      </header>

      <main className="flex flex-1 overflow-hidden">
        <section className="w-1/2 flex flex-col items-center justify-center border-r border-gray-300 px-6 text-center">
          <p className="text-3xl md:text-4xl font-bold text-slate-500 uppercase tracking-wide mb-4">
            Số thứ tự đang gọi
          </p>
          <div className="animate-pulse-slow">
            <span className="text-[18rem] md:text-[28rem] font-bold leading-none text-[#001A4D] select-none">
              {currentNumber}
            </span>
          </div>
          {roomError && (
            <p className="mt-8 text-2xl text-rose-500 font-medium">{roomError}</p>
          )}
        </section>

        <section className="w-1/2 flex flex-col p-10 md:p-14 bg-white">
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-600 uppercase">
              Danh sách bệnh nhân chờ {roomName}
            </h2>
          </div>

          <div className="flex flex-col w-full space-y-4 mt-5">
            {waitingPatients.length > 0 ? (
              waitingPatients.map((patient) => (
                <div
                  key={patient.maluotkham}
                  className="flex justify-between items-center border-b border-gray-100 pb-2"
                >
                  <div className="flex items-center gap-4">
                    <span className="inline-flex items-center justify-center min-w-[3.5rem] h-12 px-3 rounded bg-[#E6F0FF] text-[#0084FF] text-2xl font-bold">
                      {patient.stt_trong_phong ?? '--'}
                    </span>
                    <span className="text-xl text-slate-600 font-medium">
                      {patient.hoten}
                    </span>
                  </div>
                  <span className="text-xl text-slate-400 font-thin">
                    {patient.namsinh != null
                      ? `${new Date().getFullYear() - Number(patient.namsinh)} tuổi`
                      : ''}
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

      <footer className="bg-[#0084FF] py-6 border-t border-gray-300">
        <div className="text-center">
          <p className="slogan-text text-4xl md:text-6xl text-white">
            Tận tâm chăm sóc – Nâng tầm sức khỏe
          </p>
        </div>
      </footer>

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
