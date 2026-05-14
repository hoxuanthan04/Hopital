import React, { useCallback, useEffect, useState } from 'react';
import { ArrowRight, FileText, Loader2, RefreshCw, Save, Search, UploadCloud } from 'lucide-react';
import PhongKhamService from '../../services/phongkham.service';
import ExaminationService from '../../services/examination.service';
import { uploadDicomSingle } from '../../services/upload.service';

const MACHINE_STORAGE_KEY = 'tth_mamayphong';

type PhongRow = {
  maphong: number;
  tenphong?: string | null;
  chucnang?: string | null;
  trangthai?: string | null;
  tenchuyenkhoa?: string | null;
  mamayphong?: string | null;
};

type ChidinhQueueRow = {
  machidinh: number;
  mahosokham: number;
  madichvu: number;
  trangthai?: string | null;
  ketquahinhanh?: string | null;
  dicom_url?: string | null;
  dicom_public_id?: string | null;
  dicom_tenfile?: string | null;
  maluotkham?: number | null;
  mabenhnhan?: number | null;
  hoten?: string | null;
  namsinh?: number | null;
  gioitinh?: string | null;
  ngaykham?: string | null;
  lydokham?: string | null;
  tendichvu?: string | null;
  loaidichvu?: string | null;
  stt_trong_phong?: number | null;
};

type ResultDraft = {
  ketquahinhanh: string;
  file: File | null;
};

function getResolvedMachineCode(): string | null {
  const fromQuery = new URLSearchParams(window.location.search).get('mamay');
  if (fromQuery && fromQuery.trim()) return fromQuery.trim();
  const fromStorage = localStorage.getItem(MACHINE_STORAGE_KEY);
  if (fromStorage && fromStorage.trim()) return fromStorage.trim();
  return null;
}

function normalizeDeptName(value: unknown): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .trim();
}

function isDiagnosticImagingRoom(room: PhongRow | null) {
  return normalizeDeptName(room?.tenchuyenkhoa).includes('chan doan hinh anh');
}

function isActiveRoom(room: PhongRow | null) {
  const tt = String(room?.trangthai || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .trim()
    .toLowerCase();
  return tt === 'dang hoat dong' || tt === 'active';
}

function getErrorMessage(error: unknown, fallback: string) {
  return (
    (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
    (error instanceof Error ? error.message : '') ||
    fallback
  );
}

export default function DiagnosticImaging() {
  const [queue, setQueue] = useState<ChidinhQueueRow[]>([]);
  const [room, setRoom] = useState<PhongRow | null>(null);
  const [roomError, setRoomError] = useState<string | null>(null);
  const [pendingMamay, setPendingMamay] = useState(() => localStorage.getItem(MACHINE_STORAGE_KEY) || '');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [selected, setSelected] = useState<ChidinhQueueRow | null>(null);
  const [draft, setDraft] = useState<ResultDraft>({ ketquahinhanh: '', file: null });
  const [savingId, setSavingId] = useState<number | null>(null);
  const [invitingId, setInvitingId] = useState<number | null>(null);

  const resolveRoom = useCallback(async () => {
    setRoomError(null);
    setRoom(null);
    const code = getResolvedMachineCode();
    if (!code) {
      setRoomError('Chưa có mã máy. Nhập mã trùng với mamayphong của phòng cận lâm sàng để nhận hàng đợi.');
      setLoading(false);
      return;
    }

    try {
      const phong = (await PhongKhamService.getByMachineCode(code)) as PhongRow;
      if (!phong?.maphong) {
        setRoomError('Phòng trả về không có mã phòng.');
        return;
      }
      if (!isDiagnosticImagingRoom(phong)) {
        setRoomError(
          `Phòng "${phong.tenphong || '—'}" thuộc khoa "${phong.tenchuyenkhoa || '—'}". Trang Chẩn đoán hình ảnh chỉ dành cho phòng thuộc khoa "Chẩn đoán hình ảnh - xét nghiệm". Vui lòng mở trang Khám bệnh thay vào đó.`
        );
        return;
      }
      if (!isActiveRoom(phong)) {
        setRoomError(`Phòng "${phong.tenphong || '—'}" hiện chưa ở trạng thái hoạt động. Chỉ định mới sẽ không được phân về phòng này.`);
      }
      setRoom(phong);
    } catch (error) {
      setRoomError(getErrorMessage(error, 'Không tìm thấy phòng với mã máy này.'));
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
      const data = await ExaminationService.listChidinhByPhong(room.maphong);
      setQueue(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Lỗi khi tải hàng đợi chỉ định CLS:', error);
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
    setLoading(true);
    await resolveRoom();
  };

  const openItem = (item: ChidinhQueueRow) => {
    setSelected(item);
    setDraft({
      ketquahinhanh: item.ketquahinhanh || '',
      file: null,
    });
  };

  const handleInvite = async (item: ChidinhQueueRow) => {
    const tt = (item.trangthai || '').trim();
    if (tt === 'Đã hoàn thành' || tt === 'Đã hủy') {
      window.alert('Chỉ định đã kết thúc, không thể mời vào.');
      return;
    }
    setInvitingId(item.machidinh);
    try {
      await ExaminationService.markChidinhDangThucHien(item.machidinh);
      await fetchQueue();
      openItem({ ...item, trangthai: 'Đang thực hiện' });
    } catch (error) {
      window.alert(getErrorMessage(error, 'Không thể cập nhật trạng thái chỉ định.'));
    } finally {
      setInvitingId(null);
    }
  };

  const handleSaveResult = async () => {
    if (!selected) return;
    if (!draft.ketquahinhanh.trim() && !draft.file && !selected.dicom_url) {
      window.alert('Vui lòng nhập kết luận hoặc chọn file DICOM.');
      return;
    }

    setSavingId(selected.machidinh);
    try {
      let uploaded: { url?: string; publicId?: string; originalName?: string } | null = null;
      if (draft.file) uploaded = await uploadDicomSingle(draft.file);

      await ExaminationService.saveChidinhKetQua(selected.machidinh, {
        ketquahinhanh: draft.ketquahinhanh.trim(),
        dicom_url: uploaded?.url || selected.dicom_url || null,
        dicom_public_id: uploaded?.publicId || selected.dicom_public_id || null,
        dicom_tenfile: uploaded?.originalName || selected.dicom_tenfile || null,
      });

      window.alert('Đã lưu kết quả. Chỉ định được đánh dấu Đã hoàn thành.');
      setSelected(null);
      setDraft({ ketquahinhanh: '', file: null });
      await fetchQueue();
    } catch (error) {
      window.alert(getErrorMessage(error, 'Không lưu được kết quả.'));
    } finally {
      setSavingId(null);
    }
  };

  const filteredQueue = queue.filter((item) => {
    const q = searchTerm.toLowerCase();
    if (!q) return true;
    return (
      item.hoten?.toLowerCase().includes(q) ||
      item.tendichvu?.toLowerCase().includes(q) ||
      String(item.maluotkham || '').includes(q) ||
      String(item.machidinh).includes(q)
    );
  });

  const machineLabel = getResolvedMachineCode() || '(chưa cấu hình)';

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="mx-auto space-y-6">
        {roomError && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-semibold mb-2">{roomError}</p>
            <form onSubmit={handleSaveMamay} className="flex flex-wrap items-end gap-2 mt-3">
              <div className="flex flex-col gap-1">
                <label htmlFor="mamay-diagnostic" className="text-xs font-bold uppercase text-amber-800">
                  Mã máy phòng
                </label>
                <input
                  id="mamay-diagnostic"
                  value={pendingMamay}
                  onChange={(e) => setPendingMamay(e.target.value)}
                  placeholder="VD: MAY-XQUANG-01"
                  className="min-w-[220px] px-3 py-2 border border-amber-300 rounded text-slate-800"
                />
              </div>
              <button type="submit" className="px-4 py-2 bg-amber-600 text-white rounded font-medium hover:bg-amber-700">
                Lưu &amp; nhận phòng
              </button>
            </form>
          </div>
        )}

        <div className="flex justify-between items-end flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Chẩn đoán hình ảnh - xét nghiệm</h1>
            <p className="text-slate-500 text-sm mt-1">
              Phòng: <span className="font-medium text-slate-700">{room?.tenphong || '—'}</span>
              {' · '}
              Chức năng: <span className="font-medium text-slate-700">{room?.chucnang || '—'}</span>
              {' · '}
              Trạng thái: <span className={`font-medium ${isActiveRoom(room) ? 'text-emerald-600' : 'text-rose-600'}`}>
                {room?.trangthai || '—'}
              </span>
            </p>
            <p className="text-slate-400 text-xs mt-1">
              Mã máy trạm: <span className="font-mono text-slate-600">{machineLabel}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => (room?.maphong ? fetchQueue() : resolveRoom())}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded text-sm font-medium hover:bg-slate-50 shadow-sm"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Làm mới
            </button>
            <button
              type="button"
              onClick={() => window.open('/staff/goiso', '_blank', 'noopener,noreferrer')}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded text-sm font-medium hover:bg-slate-50 shadow-sm"
            >
              Hiển thị màn hình gọi số
            </button>
          </div>
        </div>

        {room && (
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            <section className="xl:col-span-2 bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Tìm bệnh nhân, dịch vụ hoặc mã chỉ định..."
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">STT</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Bệnh nhân / Dịch vụ</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Trạng thái</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredQueue.map((item, index) => {
                      const isDoing = (item.trangthai || '').trim() === 'Đang thực hiện';
                      const isSelected = selected?.machidinh === item.machidinh;
                      return (
                        <tr
                          key={item.machidinh}
                          className={`${isDoing ? 'bg-blue-50/50' : ''} ${isSelected ? 'ring-2 ring-blue-200' : ''}`}
                        >
                          <td className="px-4 py-3 text-sm font-bold">
                            {item.stt_trong_phong != null ? item.stt_trong_phong : index + 1}
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-slate-800">{item.hoten || `BN #${item.mabenhnhan ?? '—'}`}</p>
                            <p className="text-xs text-slate-500">
                              {item.tendichvu || `DV #${item.madichvu}`} · Lượt #{item.maluotkham ?? '—'}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">{item.trangthai || '—'}</td>
                          <td className="px-4 py-3 text-right">
                            {isDoing ? (
                              <button
                                type="button"
                                onClick={() => openItem(item)}
                                className="inline-flex items-center gap-1 text-blue-600 text-sm hover:underline font-bold"
                              >
                                Nhập kết quả <ArrowRight size={16} />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleInvite(item)}
                                disabled={invitingId === item.machidinh}
                                className="inline-flex items-center gap-1 text-blue-600 text-sm hover:underline font-bold disabled:opacity-40"
                              >
                                {invitingId === item.machidinh ? (
                                  <Loader2 className="animate-spin" size={14} />
                                ) : (
                                  <>
                                    Mời vào <ArrowRight size={16} />
                                  </>
                                )}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {filteredQueue.length === 0 && !loading && (
                <div className="p-10 text-center text-slate-400">
                  Không có chỉ định cận lâm sàng nào được phân về phòng này.
                </div>
              )}
            </section>

            <section className="xl:col-span-3 bg-white rounded border border-slate-200 shadow-sm min-h-[520px]">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <h2 className="font-bold text-slate-800">Kết quả thực hiện</h2>
                  <p className="text-sm text-slate-500">
                    {selected
                      ? `BN: ${selected.hoten || '—'} · Lượt #${selected.maluotkham ?? '—'} · Chỉ định #${selected.machidinh}`
                      : 'Chọn chỉ định từ hàng đợi để nhập kết quả.'}
                  </p>
                </div>
              </div>

              {!selected ? (
                <div className="p-12 text-center text-slate-400">
                  <FileText size={48} className="mx-auto mb-3 text-slate-300" />
                  Bấm "Mời vào" trên một chỉ định bên trái để bắt đầu thực hiện.
                </div>
              ) : (
                <div className="p-5 space-y-4">
                  <div className="rounded border border-slate-200 p-4 space-y-3">
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <p className="font-bold text-slate-800">{selected.tendichvu || `Chỉ định #${selected.machidinh}`}</p>
                        <p className="text-xs text-slate-500">
                          {selected.loaidichvu || '—'} · {selected.trangthai || 'Chờ thực hiện'}
                        </p>
                        {selected.lydokham && (
                          <p className="text-xs text-slate-500 mt-1">Lý do khám: {selected.lydokham}</p>
                        )}
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
                        {selected.trangthai || 'Chờ thực hiện'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase">Kết luận hình ảnh / xét nghiệm</label>
                      <textarea
                        rows={5}
                        className="w-full p-3 border border-slate-200 rounded outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                        placeholder="Nhập mô tả và kết luận..."
                        value={draft.ketquahinhanh}
                        onChange={(e) => setDraft((prev) => ({ ...prev, ketquahinhanh: e.target.value }))}
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <label className="inline-flex items-center gap-2 px-3 py-2 rounded border border-dashed border-slate-300 text-sm text-slate-600 cursor-pointer hover:bg-slate-50">
                        <UploadCloud size={16} />
                        <span>{draft.file ? draft.file.name : 'Chọn file DICOM'}</span>
                        <input
                          type="file"
                          accept=".dcm,.dicom,application/dicom"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setDraft((prev) => ({ ...prev, file }));
                          }}
                        />
                      </label>
                      {selected.dicom_url && (
                        <a
                          href={selected.dicom_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-medium text-blue-600 hover:underline"
                        >
                          {selected.dicom_tenfile || 'Mở DICOM đã tải'}
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={handleSaveResult}
                        disabled={savingId === selected.machidinh}
                        className="ml-auto inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 disabled:opacity-60 text-sm"
                      >
                        {savingId === selected.machidinh ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        Lưu kết quả &amp; hoàn thành
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
