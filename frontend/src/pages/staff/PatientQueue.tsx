import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, RefreshCw, Search } from 'lucide-react';
import LuotKhamService from '../../services/LuotKhamService';
import PhongKhamService from '../../services/phongkham.service';

const MACHINE_STORAGE_KEY = 'tth_mamayphong';

type PhongRow = {
  maphong: number;
  tenphong?: string | null;
  machuyenkhoa?: number | null;
  tenchuyenkhoa?: string | null;
  mamayphong?: string | null;
};

type QueuePatient = {
  maluotkham: number;
  mabenhnhan?: number;
  hoten?: string;
  namsinh?: number | null;
  ngaykham?: string;
  trangthai?: string | null;
  maphong?: number | null;
};

/** Thứ tự ưu tiên: query ?mamay= → localStorage → biến môi trường Vite */
function getResolvedMachineCode(): string | null {
  const fromQuery = new URLSearchParams(window.location.search).get('mamay');
  if (fromQuery && fromQuery.trim()) return fromQuery.trim();

  const fromStorage = localStorage.getItem(MACHINE_STORAGE_KEY);
  if (fromStorage && fromStorage.trim()) return fromStorage.trim();

  const fromEnv = import.meta.env.VITE_MAMAY_PHONG as string | undefined;
  if (fromEnv && String(fromEnv).trim()) return String(fromEnv).trim();

  return null;
}

const PatientQueue = () => {
  const navigate = useNavigate();
  const [queue, setQueue] = useState<QueuePatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [room, setRoom] = useState<PhongRow | null>(null);
  const [roomError, setRoomError] = useState<string | null>(null);
  const [pendingMamay, setPendingMamay] = useState(() => localStorage.getItem(MACHINE_STORAGE_KEY) || '');

  const resolveRoom = useCallback(async () => {
    setRoomError(null);
    setRoom(null);
    const code = getResolvedMachineCode();
    if (!code) {
      setRoomError(
        'Chưa có mã máy. Nhập mã trùng với cột mamayphong trong danh mục phòng (Admin → Phòng), hoặc thêm ?mamay=... vào URL / biến VITE_MAMAY_PHONG.'
      );
      setLoading(false);
      return;
    }
    try {
      const phong = (await PhongKhamService.getByMachineCode(code)) as PhongRow;
      if (!phong?.maphong) {
        setRoomError('Phòng trả về không có mã phòng (maphong).');
        setLoading(false);
        return;
      }
      setRoom(phong);
    } catch (e) {
      console.error(e);
      setRoomError('Không tìm thấy phòng khám với mã máy này trong hệ thống.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    resolveRoom();
  }, [resolveRoom]);

  const fetchQueue = useCallback(async () => {
    if (!room?.maphong) return;
    setLoading(true);
    try {
      const data = await LuotKhamService.getByPhong(room.maphong);
      setQueue(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Lỗi khi tải danh sách chờ:', error);
      setQueue([]);
    } finally {
      setLoading(false);
    }
  }, [room?.maphong]);

  useEffect(() => {
    if (!room?.maphong) return;
    fetchQueue();
    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);
  }, [room?.maphong, fetchQueue]);

  const handleSaveMamay = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = pendingMamay.trim();
    if (!v) return;
    localStorage.setItem(MACHINE_STORAGE_KEY, v);
    setRoomError(null);
    setLoading(true);
    await resolveRoom();
  };

  const handleInvite = async (patient: QueuePatient) => {
    console.log('Nút mời đã bấm cho:', patient.hoten);
    navigate('/staff/examination', {
      state: {
        patient: { ...patient, trangthai: 'Đang khám' },
      },
    });
    try {
      await LuotKhamService.update(patient.maluotkham, {
        ...patient,
        trangthai: 'Đang khám',
      });
      console.log('Cập nhật trạng thái thành công');
    } catch (error) {
      console.error('Lỗi cập nhật DB:', error);
    }
  };

  const handleCallNumber = () => {
    window.open('/staff/goiso', '_blank', 'noopener,noreferrer');
  };

  const filteredQueue = queue.filter(
    (p) =>
      p.hoten?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.maluotkham?.toString().includes(searchTerm)
  );

  const deptLabel = room?.tenchuyenkhoa || room?.tenphong || '—';
  const roomTitle = room?.tenphong ? `${room.tenphong}` : 'Danh sách chờ';
  const machineLabel = getResolvedMachineCode() || '(chưa cấu hình)';

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="mx-auto space-y-6">
        {roomError && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-semibold mb-2">{roomError}</p>
            <form onSubmit={handleSaveMamay} className="flex flex-wrap items-end gap-2 mt-3">
              <div className="flex flex-col gap-1">
                <label htmlFor="mamay-input" className="text-xs font-bold uppercase text-amber-800">
                  Mã máy phòng (mamayphong)
                </label>
                <input
                  id="mamay-input"
                  value={pendingMamay}
                  onChange={(e) => setPendingMamay(e.target.value)}
                  placeholder="VD: MAY-PK-01"
                  className="min-w-[220px] px-3 py-2 border border-amber-300 rounded text-slate-800"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-600 text-white rounded font-medium hover:bg-amber-700"
              >
                Lưu &amp; nhận phòng
              </button>
            </form>
          </div>
        )}

        <div className="flex justify-between items-end flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              Danh sách chờ khám — {roomTitle}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Khoa: <span className="font-medium text-slate-700">{deptLabel}</span>
              {room?.maphong != null && (
                <>
                  {' '}
                  · Mã phòng: <span className="font-mono">{room.maphong}</span>
                </>
              )}
            </p>
            <p className="text-slate-400 text-xs mt-1">
              Mã máy trạm: <span className="font-mono text-slate-600">{machineLabel}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                if (room?.maphong) fetchQueue();
                else resolveRoom();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded text-sm font-medium hover:bg-slate-50 transition-all shadow-sm"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Làm mới
            </button>
            <button
              type="button"
              onClick={handleCallNumber}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded text-sm font-medium hover:bg-slate-50 transition-all shadow-sm"
            >
              Hiển thị màn hình gọi số
            </button>
          </div>
        </div>

        {room && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded border border-slate-200 shadow-sm">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Đang khám</p>
              <h2 className="font-bold mt-1 text-blue-600">
                {queue.find((p) => p.trangthai === 'Đang khám')?.hoten || 'Trống'}
              </h2>
            </div>
            <div className="bg-white p-4 rounded border border-slate-200 shadow-sm">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Tổng số chờ</p>
              <h2 className=" font-bold text-slate-800 mt-1">
                {queue.filter((p) => p.trangthai === 'Đang đợi').length} bệnh nhân
              </h2>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Tìm kiếm tên hoặc mã BN..."
                className="w-full h-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        )}

        {room && (
          <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">STT</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Mã BN</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Họ và Tên</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Năm sinh</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Giờ đến</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Trạng thái</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQueue.map((patient, index) => (
                  <tr
                    key={patient.maluotkham}
                    className={`hover:bg-slate-50 transition-colors ${patient.trangthai === 'Đang khám' ? 'bg-blue-50/50' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <span className="w-8 h-8 flex items-center justify-center font-bold text-sm">{index + 1}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">#{patient.maluotkham}</td>
                    <td className="px-6 py-4 text-slate-800">{patient.hoten}</td>
                    <td className="px-6 py-4 text-center text-slate-600">{patient.namsinh ?? '—'}</td>
                    <td className="px-6 py-4 text-slate-500">
                      {patient.ngaykham
                        ? new Date(patient.ngaykham).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-sm">{patient.trangthai}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleInvite(patient)}
                        className="inline-flex items-center gap-1 text-blue-600 text-sm hover:underline font-bold"
                      >
                        Mời vào <ArrowRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredQueue.length === 0 && !loading && (
              <div className="p-12 text-center text-slate-400">Không tìm thấy bệnh nhân nào trong danh sách.</div>
            )}
            {loading && room && (
              <div className="p-12 text-center text-slate-400">Đang tải dữ liệu hàng đợi...</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientQueue;
