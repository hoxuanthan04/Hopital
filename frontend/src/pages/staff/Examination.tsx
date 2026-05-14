import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Plus,
  Trash2,
  Printer,
  Save,
  Search,
  Loader2,
  CheckCircle2,
  FileSearch,
  Download,
  ClipboardCheck,
} from 'lucide-react';
import MedicineSearchModal from '../../components/staff/MedicineSearchModal';
import ExaminationService from '../../services/examination.service';
import VattuService from '../../services/vattu.service';

type PatientState = {
  maluotkham: number;
  mabenhnhan?: number;
  hoten?: string;
  namsinh?: number;
  gioitinh?: string;
  ngaykham?: string;
  lydokham?: string;
  tiensu?: string;
  trangthai?: string;
};

type ChidinhRow = {
  machidinh: number;
  mahosokham: number;
  madichvu: number;
  trangthai?: string | null;
  tendichvu?: string | null;
  loaidichvu?: string | null;
  maphong_thuchien?: number | null;
  tenphong_thuchien?: string | null;
  ketquahinhanh?: string | null;
  dicom_url?: string | null;
  dicom_tenfile?: string | null;
  ngaythuchien?: string | null;
};

const TRANGTHAI_DANG_CLS = 'Đang thực hiện CLS';
const TRANGTHAI_CHO_KET_LUAN = 'Chờ kết luận';

type SessionPayload = {
  luotkham: Record<string, unknown>;
  hosokhambenh: Record<string, unknown>;
  chidinh: ChidinhRow[];
  canlamsangByCategory: Record<string, { madichvu: number; tendichvu?: string; loaidichvu?: string }[]>;
};

type RxLine = {
  key: string;
  mavattu: number;
  ten: string;
  sl: number;
  dv: string;
  lieudung: string;
  cachdung: string;
};

const TAB_ORDER = ['XetNghiem', 'SieuAm', 'XQuang', 'NoiSoi'] as const;
type TabId = (typeof TAB_ORDER)[number];

const TAB_LABEL: Record<TabId, string> = {
  XetNghiem: 'XÉT NGHIỆM',
  SieuAm: 'SIÊU ÂM',
  XQuang: 'X-QUANG',
  NoiSoi: 'NỘI SOI',
};

function tabLabel(tab: string): string {
  return TAB_LABEL[tab as TabId] ?? tab;
}

export default function Examination() {
  const location = useLocation();
  const navigate = useNavigate();
  const patientData = (location.state?.patient ?? null) as PatientState | null;

  const [activeTabCLS, setActiveTabCLS] = useState<TabId>('XetNghiem');
  const [showAddMedicine, setShowAddMedicine] = useState(false);

  const [session, setSession] = useState<SessionPayload | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const [thuocCatalog, setThuocCatalog] = useState<
    { mavattu: number; tenvattu?: string; loaivattu?: string; huongdansudung?: string; congdung?: string }[]
  >([]);

  const [chandoansobo, setChandoansobo] = useState('');
  const [ketluan, setKetluan] = useState('');
  const [prescriptions, setPrescriptions] = useState<RxLine[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  const loadSession = useCallback(async () => {
    if (!patientData?.maluotkham) return;
    setSessionLoading(true);
    setSessionError(null);
    try {
      const data = (await ExaminationService.getSession(patientData.maluotkham)) as SessionPayload;
      setSession(data);
      const h = data.hosokhambenh;
      setChandoansobo(h?.chandoansobo != null ? String(h.chandoansobo) : '');
      setKetluan(h?.ketluan != null ? String(h.ketluan) : '');
    } catch (e: unknown) {
      const msg =
        typeof e === 'object' && e !== null && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setSessionError(msg || 'Không tải được phiên khám.');
      setSession(null);
    } finally {
      setSessionLoading(false);
    }
  }, [patientData?.maluotkham]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await VattuService.getByLoaiVattu('thuốc');
        if (!cancelled) setThuocCatalog(Array.isArray(list) ? list : []);
      } catch {
        if (!cancelled) setThuocCatalog([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const hoso = session?.hosokhambenh;
  const mahosokham = hoso?.mahosokham != null ? Number(hoso.mahosokham) : null;
  const trieuchungDisplay = useMemo(() => {
    const t = hoso?.trieuchungbandau != null ? String(hoso.trieuchungbandau) : '';
    if (t.trim()) return t;
    return patientData?.lydokham != null ? String(patientData.lydokham) : '';
  }, [hoso, patientData]);

  const chidinhList = session?.chidinh ?? [];
  const canGroup = session?.canlamsangByCategory ?? {};

  const clsAllDone = useMemo(() => {
    if (chidinhList.length === 0) return true;
    return chidinhList.every((c) => (c.trangthai || '').trim() === 'Đã hoàn thành');
  }, [chidinhList]);

  const luotTrangThai = useMemo(() => {
    const luot = session?.luotkham as Record<string, unknown> | undefined;
    return String(luot?.trangthai ?? '').trim();
  }, [session]);

  const hosoTrangThai = useMemo(() => {
    const h = session?.hosokhambenh as Record<string, unknown> | undefined;
    return String(h?.trangthai ?? '').trim();
  }, [session]);

  const formLocked = useMemo(() => {
    if (!session) return false;
    if (luotTrangThai === 'Hoàn thành') return true;
    return hosoTrangThai === 'Chờ thanh toán' || hosoTrangThai === 'Đã hoàn tất';
  }, [session, luotTrangThai, hosoTrangThai]);

  const isExecutingCls = hosoTrangThai === TRANGTHAI_DANG_CLS;
  const isChoKetLuan = hosoTrangThai === TRANGTHAI_CHO_KET_LUAN;
  /**
   * Khóa thêm / xóa chỉ định khi đã chuyển sang giai đoạn thực hiện CLS.
   * Ở trạng thái «Chờ kết luận» vẫn cho phép bác sĩ bổ sung CLS — backend sẽ tự
   * đưa hồ sơ + lượt khám về lại «Đang thực hiện CLS» khi có chỉ định mới.
   */
  const clsLocked = formLocked || isExecutingCls;

  const canStartCls = useMemo(() => {
    if (formLocked || isExecutingCls || isChoKetLuan) return false;
    return chidinhList.length > 0;
  }, [formLocked, isExecutingCls, isChoKetLuan, chidinhList.length]);

  /**
   * «Hoàn tất khám» chỉ khả dụng khi:
   *  - Không có CLS (state vẫn 'Đang khám') → khám trực tiếp,
   *  - Hoặc đã sang 'Chờ kết luận' (mọi CLS done).
   */
  const canComplete =
    clsAllDone &&
    ketluan.trim().length > 0 &&
    !formLocked &&
    !isExecutingCls &&
    (chidinhList.length === 0 || isChoKetLuan);

  const bacsId = useMemo(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || 'null');
      return u?.manguoidung != null ? Number(u.manguoidung) : null;
    } catch {
      return null;
    }
  }, []);

  const handleAddChidinh = async (madichvu: number) => {
    if (clsLocked) return;
    if (!mahosokham || !patientData?.maluotkham) return;
    setActionLoading(true);
    try {
      await ExaminationService.addChidinh({
        mahosokham,
        madichvu,
        bacsichidinh: bacsId,
        maluotkham: patientData.maluotkham,
      });
      await loadSession();
    } catch (e: unknown) {
      const msg =
        typeof e === 'object' && e !== null && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      window.alert(msg || 'Không thêm được chỉ định.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveChidinh = async (machidinh: number) => {
    if (formLocked) return;
    if (!window.confirm('Xóa chỉ định này?')) return;
    setActionLoading(true);
    try {
      await ExaminationService.deleteChidinh(machidinh);
      await loadSession();
    } catch (e: unknown) {
      const msg =
        typeof e === 'object' && e !== null && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      window.alert(msg || 'Không xóa được.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkClsDone = async (machidinh: number) => {
    if (formLocked) return;
    setActionLoading(true);
    try {
      await ExaminationService.markChidinhHoanThanh(machidinh);
      await loadSession();
    } catch (e: unknown) {
      const msg =
        typeof e === 'object' && e !== null && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      window.alert(msg || 'Cập nhật thất bại.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartCls = async () => {
    if (!canStartCls) return;
    if (!mahosokham || !patientData?.maluotkham) return;
    if (
      !window.confirm(
        'Chuyển sang giai đoạn thực hiện CLS? Sau khi xác nhận sẽ không thể thêm / xóa chỉ định, chờ các phòng CLS trả kết quả.'
      )
    ) {
      return;
    }
    setActionLoading(true);
    try {
      const res = (await ExaminationService.startChidinhExecution({
        mahosokham,
        maluotkham: patientData.maluotkham,
      })) as { trangthai?: string };
      await loadSession();
      window.alert(
        res?.trangthai === TRANGTHAI_CHO_KET_LUAN
          ? 'Tất cả CLS đã có kết quả. Chuyển sang chờ kết luận của bác sĩ.'
          : 'Đã chuyển trạng thái sang Đang thực hiện CLS. Hệ thống sẽ tự chuyển sang Chờ kết luận khi mọi CLS có kết quả.'
      );
    } catch (e: unknown) {
      const msg =
        typeof e === 'object' && e !== null && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      window.alert(msg || 'Không thể chuyển trạng thái.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddMedicine = (newMed: Omit<RxLine, 'key'>) => {
    if (formLocked) return;
    if (prescriptions.some((p) => p.mavattu === newMed.mavattu)) {
      window.alert('Thuốc này đã có trong đơn.');
      setShowAddMedicine(false);
      return;
    }
    setPrescriptions((prev) => [
      ...prev,
      { ...newMed, key: `${newMed.mavattu}-${Date.now()}` },
    ]);
    setShowAddMedicine(false);
  };

  const handleDeleteMedicine = (key: string) => {
    if (formLocked) return;
    setPrescriptions((prev) => prev.filter((p) => p.key !== key));
  };

  const updateRx = (key: string, patch: Partial<RxLine>) => {
    if (formLocked) return;
    setPrescriptions((prev) => prev.map((p) => (p.key === key ? { ...p, ...patch } : p)));
  };

  const handleComplete = async () => {
    if (!canComplete) {
      window.alert(
        !ketluan.trim()
          ? 'Nhập chẩn đoán xác định (kết luận).'
          : 'Còn chỉ định cận lâm sàng chưa hoàn thành — bấm «Hoàn thành CLS» từng dòng.'
      );
      return;
    }
    if (!mahosokham || !patientData?.maluotkham) return;
    setActionLoading(true);
    try {
      await ExaminationService.complete({
        mahosokham,
        maluotkham: patientData.maluotkham,
        chandoansobo: chandoansobo.trim() || null,
        ketluan: ketluan.trim(),
        ngayhentaikham: null,
        ketquacanlamsang: null,
        bacsiphutrach: bacsId,
        prescriptions: prescriptions.map((p) => ({
          mavattu: p.mavattu,
          soluong: p.sl,
          lieudung: p.lieudung || null,
          cachdung: p.cachdung || null,
        })),
      });
      window.alert('Đã hoàn tất khám và lưu hồ sơ.');
      navigate('/staff/patientqueue');
    } catch (e: unknown) {
      const msg =
        typeof e === 'object' && e !== null && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      window.alert(msg || 'Hoàn tất khám thất bại.');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrint = () => window.print();

  if (!patientData) {
    return (
      <div className="h-[calc(100vh-120px)] flex flex-col items-center justify-center bg-white border rounded">
        <Search size={48} className="text-slate-300 mb-4" />
        <p className="text-slate-500 font-medium">Chưa chọn bệnh nhân khám.</p>
        <button type="button" onClick={() => navigate('/staff/patientqueue')} className="mt-4 text-blue-600 font-bold underline">
          Quay lại danh sách chờ
        </button>
      </div>
    );
  }

  const tuoi =
    patientData.namsinh != null ? new Date().getFullYear() - Number(patientData.namsinh) : '—';

  return (
    <div className="bg-slate-50">
      <div className="max-w-full mx-auto bg-white rounded shadow-sm border border-slate-200 flex flex-col h-[calc(100vh-120px)]">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white rounded flex-wrap gap-3">
          <div className="flex items-center gap-4 min-w-0">
            <div className="bg-blue-600 text-white w-10 h-10 rounded flex items-center justify-center font-bold uppercase shrink-0">
              {patientData.hoten?.charAt(0)}
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-slate-800 truncate">
                BN: {patientData.hoten}
                <span className="text-slate-400 font-normal ml-2">
                  | {tuoi} tuổi - {patientData.gioitinh}
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Mã lượt: #{patientData.maluotkham}
                {patientData.ngaykham
                  ? ` — Ngày khám: ${new Date(patientData.ngaykham).toLocaleDateString('vi-VN')}`
                  : ''}
                {mahosokham ? ` — Hồ sơ: #${mahosokham}` : ''}
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded font-bold hover:bg-slate-100 transition-all text-sm"
            >
              <Printer size={18} /> In đơn thuốc
            </button>
            <button
              type="button"
              onClick={handleStartCls}
              disabled={!canStartCls || actionLoading || sessionLoading || !mahosokham}
              title={
                chidinhList.length === 0
                  ? 'Chưa có chỉ định CLS nào'
                  : isExecutingCls
                    ? 'Đang chờ các phòng CLS trả kết quả'
                    : isChoKetLuan
                      ? 'CLS đã có đủ kết quả, sẵn sàng kết luận'
                      : 'Chuyển sang giai đoạn thực hiện CLS'
              }
              className="flex items-center gap-2 px-6 py-2 bg-amber-600 text-white rounded font-bold hover:bg-amber-700 shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {actionLoading ? <Loader2 className="animate-spin" size={18} /> : <ClipboardCheck size={18} />}
              Hoàn tất chỉ định CLS
            </button>
            <button
              type="button"
              onClick={handleComplete}
              disabled={!canComplete || actionLoading || sessionLoading || !mahosokham || formLocked}
              title={
                !ketluan.trim()
                  ? 'Thiếu chẩn đoán xác định'
                  : isExecutingCls
                    ? 'Chờ phòng CLS trả kết quả trước khi kết luận'
                    : !clsAllDone
                      ? 'Còn CLS chưa hoàn thành'
                      : 'Lưu hồ sơ và kết thúc lượt khám'
              }
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {actionLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Hoàn tất khám
            </button>
          </div>
        </div>

        {sessionError && (
          <div className="mx-4 mt-3 rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{sessionError}</div>
        )}

        {formLocked && !sessionLoading && session && (
          <div className="mx-4 mt-3 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Lượt khám / hồ sơ đã hoàn tất khám. Chỉ xem thông tin; không thể chỉnh sửa hay hoàn tất lại.
          </div>
        )}

        {!formLocked && isExecutingCls && !sessionLoading && (
          <div className="mx-4 mt-3 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 flex items-center gap-2">
            <Loader2 className="animate-spin" size={16} />
            Đang chờ các phòng CLS trả kết quả. Khi tất cả chỉ định có kết quả, hệ thống sẽ tự chuyển sang
            <strong className="font-bold"> Chờ kết luận</strong>.
          </div>
        )}

        {!formLocked && isChoKetLuan && !sessionLoading && (
          <div className="mx-4 mt-3 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            Tất cả CLS đã có kết quả. Mời bác sĩ nhập <strong>chẩn đoán xác định</strong> và bấm
            <strong> Hoàn tất khám</strong>.
          </div>
        )}

        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-100 min-h-0">
          <div className="w-full lg:w-1/2 p-6 space-y-6 overflow-y-auto min-h-0">
            {sessionLoading ? (
              <div className="flex items-center gap-2 text-slate-500 py-8">
                <Loader2 className="animate-spin" size={22} /> Đang tải phiên khám…
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-600 tracking-wider uppercase">Thông tin & Tiền sử</h3>
                  <div className="grid grid-cols-1 gap-3 p-4 rounded border border-slate-100 bg-slate-50/50 text-sm">
                    <div>
                      <span className="text-slate-500 italic">Lý do khám: </span>
                      <span className="font-medium text-slate-800">{patientData.lydokham || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 italic">Tiền sử: </span>
                      <span className="font-medium text-rose-600">{patientData.tiensu || 'Không có ghi nhận đặc biệt'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-600 tracking-wider uppercase">Khám bệnh & Chẩn đoán</h3>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[12px] font-bold text-slate-400 ml-1">Triệu chứng lâm sàng (từ tiếp nhận)</label>
                      <textarea
                        readOnly
                        disabled
                        className="w-full p-3 border border-slate-200 rounded bg-slate-100 text-slate-700 min-h-[80px] cursor-not-allowed"
                        value={trieuchungDisplay}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[12px] font-bold text-slate-400 ml-1">Chẩn đoán sơ bộ</label>
                        <input
                          className="w-full p-3 border border-slate-200 rounded outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                          placeholder="Nhập chẩn đoán sơ bộ…"
                          value={chandoansobo}
                          readOnly={formLocked}
                          onChange={(e) => setChandoansobo(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[12px] font-bold text-slate-400 ml-1">Chẩn đoán xác định (kết luận) *</label>
                        <input
                          className="w-full p-3 border border-blue-100 rounded outline-none text-blue-800 font-medium focus:ring-1 focus:ring-blue-500 text-sm"
                          placeholder="Bắt buộc để hoàn tất khám…"
                          value={ketluan}
                          readOnly={formLocked}
                          onChange={(e) => setKetluan(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <h3 className="text-sm font-bold text-slate-600 tracking-wider uppercase">Chỉ định CLS & kết quả</h3>
                  {chidinhList.length === 0 ? (
                    <p className="text-sm text-slate-500 italic border border-dashed border-slate-200 rounded p-4">
                      Chưa có chỉ định cận lâm sàng. Thêm từ cột bên phải.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {chidinhList.map((c) => {
                        const done = (c.trangthai || '').trim() === 'Đã hoàn thành';
                        const ngayKQ = c.ngaythuchien
                          ? new Date(c.ngaythuchien).toLocaleString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })
                          : null;
                        return (
                          <li
                            key={c.machidinh}
                            className={`p-3 rounded border text-sm space-y-2 ${
                              done ? 'border-emerald-100 bg-emerald-50/50' : 'border-amber-100 bg-amber-50/40'
                            }`}
                          >
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="font-bold text-slate-800">{c.tendichvu || `DV #${c.madichvu}`}</p>
                                <p className="text-xs text-slate-500">
                                  {c.loaidichvu || '—'} · {c.trangthai || 'Chờ'}
                                </p>
                                {c.tenphong_thuchien && (
                                  <p className="text-xs text-blue-600 mt-1">
                                    Đã phân về: <span className="font-medium">{c.tenphong_thuchien}</span>
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {done ? (
                                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                                    <CheckCircle2 size={16} /> Đã hoàn thành
                                  </span>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleMarkClsDone(c.machidinh)}
                                      disabled={actionLoading || clsLocked}
                                      className="text-xs font-bold px-3 py-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40"
                                    >
                                      Hoàn thành CLS
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveChidinh(c.machidinh)}
                                      disabled={actionLoading || clsLocked}
                                      className="text-xs font-bold px-2 py-1.5 rounded border border-slate-200 text-rose-600 hover:bg-rose-50 disabled:opacity-40"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                            {done && (c.ketquahinhanh || c.dicom_url) && (
                              <div className="bg-white border border-emerald-100 rounded p-3 space-y-2">
                                <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase">
                                  <FileSearch size={14} /> Kết quả cận lâm sàng
                                  {ngayKQ && (
                                    <span className="ml-auto text-[11px] text-slate-500 font-medium normal-case">
                                      {ngayKQ}
                                    </span>
                                  )}
                                </div>
                                {c.ketquahinhanh && (
                                  <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                                    {c.ketquahinhanh}
                                  </p>
                                )}
                                {c.dicom_url && (
                                  <a
                                    href={c.dicom_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                                  >
                                    <Download size={14} />
                                    {c.dicom_tenfile || 'Tải file DICOM'}
                                  </a>
                                )}
                              </div>
                            )}
                            {done && !c.ketquahinhanh && !c.dicom_url && (
                              <p className="text-xs text-slate-500 italic">
                                Chưa có mô tả kết quả / file đính kèm cho chỉ định này.
                              </p>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  {chidinhList.length > 0 && !clsAllDone && !isExecutingCls && (
                    <p className="text-xs text-amber-800 font-medium">
                      Bấm <strong>Hoàn tất chỉ định CLS</strong> để chuyển sang giai đoạn thực hiện.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="w-full lg:w-1/2 p-6 space-y-6 bg-slate-50/30 overflow-y-auto min-h-0">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-600 tracking-wider uppercase">Chỉ định cận lâm sàng</h3>
              <p className="text-xs text-slate-500">
                Có thể chỉ định nhiều dịch vụ trong cùng nhóm (ví dụ nhiều loại X-quang khác nhau). Mỗi <strong>một dịch vụ cụ thể</strong> (ví dụ «Chụp X-quang xương») chỉ được thêm <strong>một lần</strong> cho lượt khám này.
              </p>
              <div className="bg-white border border-slate-200 rounded overflow-hidden shadow-sm">
                <div className="flex bg-slate-100 p-1 flex-wrap gap-1">
                  {TAB_ORDER.map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTabCLS(tab)}
                      className={`flex-1 min-w-[72px] py-1.5 text-[11px] font-bold rounded transition-all ${
                        activeTabCLS === tab ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {tabLabel(tab)}
                    </button>
                  ))}
                </div>
                <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto">
                  {(canGroup[activeTabCLS] ?? []).length === 0 ? (
                    <p className="col-span-full text-center text-xs text-slate-400 py-6">Không có dịch vụ trong nhóm này (cập nhật loaidichvu trong Admin).</p>
                  ) : (
                    (canGroup[activeTabCLS] ?? []).map((item) => (
                      <button
                        key={item.madichvu}
                        type="button"
                        disabled={actionLoading || !mahosokham || clsLocked}
                        onClick={() => handleAddChidinh(item.madichvu)}
                        className="text-left px-3 py-2 text-xs border border-slate-100 hover:border-blue-400 hover:bg-blue-50 transition-all flex justify-between items-center gap-1 group disabled:opacity-50"
                      >
                        <span className="line-clamp-2">{item.tendichvu}</span>
                        <Plus size={14} className="text-slate-300 group-hover:text-blue-500 shrink-0" />
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <h3 className="text-sm font-bold text-slate-600 tracking-wider uppercase">Đơn thuốc điều trị</h3>
                <button
                  type="button"
                  onClick={() => !formLocked && setShowAddMedicine(true)}
                  disabled={formLocked}
                  className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline disabled:opacity-40 disabled:no-underline"
                >
                  <Search size={14} /> Thêm thuốc
                </button>
              </div>
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {prescriptions.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Chưa có thuốc — có thể hoàn tất khám không kê đơn.</p>
                ) : (
                  prescriptions.map((item, index) => (
                    <div key={item.key} className="bg-white p-3 rounded border border-slate-200 shadow-sm relative group space-y-2">
                      <div className="flex justify-between gap-2">
                        <span className="font-bold text-sm text-slate-800">
                          {index + 1}. {item.ten}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteMedicine(item.key)}
                          disabled={formLocked}
                          className="text-rose-500 hover:bg-rose-50 rounded p-1 disabled:opacity-30"
                          title="Xóa"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <label className="col-span-1 flex flex-col gap-0.5">
                          <span className="text-slate-400 font-bold">Số lượng</span>
                          <input
                            type="number"
                            min={1}
                            readOnly={formLocked}
                            className="border border-slate-200 rounded px-2 py-1"
                            value={item.sl}
                            onChange={(e) => updateRx(item.key, { sl: Math.max(1, Number(e.target.value) || 1) })}
                          />
                        </label>
                        <label className="col-span-1 flex flex-col gap-0.5">
                          <span className="text-slate-400 font-bold">Đơn vị</span>
                          <input
                            readOnly={formLocked}
                            className="border border-slate-200 rounded px-2 py-1"
                            value={item.dv}
                            onChange={(e) => updateRx(item.key, { dv: e.target.value })}
                          />
                        </label>
                        <label className="col-span-2 flex flex-col gap-0.5">
                          <span className="text-slate-400 font-bold">Liều dùng</span>
                          <input
                            readOnly={formLocked}
                            className="border border-slate-200 rounded px-2 py-1"
                            value={item.lieudung}
                            onChange={(e) => updateRx(item.key, { lieudung: e.target.value })}
                            placeholder="VD: 500mg x 2 lần/ngày"
                          />
                        </label>
                        <label className="col-span-2 flex flex-col gap-0.5">
                          <span className="text-slate-400 font-bold">Cách dùng</span>
                          <input
                            readOnly={formLocked}
                            className="border border-slate-200 rounded px-2 py-1"
                            value={item.cachdung}
                            onChange={(e) => updateRx(item.key, { cachdung: e.target.value })}
                          />
                        </label>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <MedicineSearchModal
        isOpen={showAddMedicine}
        onClose={() => setShowAddMedicine(false)}
        onAddMedicine={handleAddMedicine}
        medicines={thuocCatalog}
      />

      <div id="print-section" className="hidden print:block p-8 text-black">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold">PHÒNG KHÁM ĐA KHOA</h1>
          <p className="text-sm italic">Đơn thuốc điều trị</p>
          <div className="border-b-2 border-black my-4" />
          <h2 className="text-2xl font-bold mt-4">ĐƠN THUỐC</h2>
        </div>
        <div className="mb-6 space-y-1 text-sm">
          <p>
            <strong>Bệnh nhân:</strong> {patientData.hoten}{' '}
            <span className="ml-6">
              <strong>Tuổi:</strong> {tuoi}
            </span>{' '}
            <span className="ml-6">
              <strong>Giới:</strong> {patientData.gioitinh}
            </span>
          </p>
          <p>
            <strong>Mã lượt khám:</strong> #{patientData.maluotkham}
          </p>
          <p>
            <strong>Chẩn đoán sơ bộ:</strong> {chandoansobo || '—'}
          </p>
          <p>
            <strong>Chẩn đoán xác định:</strong> {ketluan || '—'}
          </p>
        </div>
        <table className="w-full mb-6 text-sm">
          <thead>
            <tr className="border-b border-black">
              <th className="text-left py-2">STT</th>
              <th className="text-left py-2">Tên thuốc</th>
              <th className="text-left py-2">Liều dùng</th>
              <th className="text-right py-2">SL</th>
            </tr>
          </thead>
          <tbody>
            {prescriptions.map((p, i) => (
              <tr key={p.key} className="border-b border-dotted border-slate-400">
                <td className="py-2">{i + 1}</td>
                <td className="py-2 font-bold">{p.ten}</td>
                <td className="py-2">{p.lieudung || '—'}</td>
                <td className="py-2 text-right">
                  {p.sl} {p.dv}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {prescriptions.map((p) => (
          <p key={`cd-${p.key}`} className="text-xs mb-1">
            <em>{p.ten}:</em> {p.cachdung || '—'}
          </p>
        ))}
        <div className="flex justify-between mt-12 text-sm">
          <div className="text-center">
            <p>Bệnh nhân / người nhà ký</p>
            <div className="h-16" />
            <p className="font-bold">{patientData.hoten}</p>
          </div>
          <div className="text-center">
            <p>
              Ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
            </p>
            <p className="font-bold">Bác sĩ kê đơn</p>
            <div className="h-16" />
            <p className="font-bold">………………</p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-section, #print-section * { visibility: visible; }
          #print-section { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}
