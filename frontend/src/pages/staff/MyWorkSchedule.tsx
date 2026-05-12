import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MapPin,
  Clock,
  StickyNote,
  User,
  LayoutGrid,
  Calendar1,
  FileDown,
} from 'lucide-react';
import LichLamViecService from '../../services/lichlamviec.service';
import NhanVienService from '../../services/nhanvien.service';
import { exportSchedulesToXlsx } from '../../utils/exportScheduleExcel';

type ViewMode = 'week' | 'day';

type ScheduleRow = {
  id: number;
  manhanvien: number;
  maphong: number;
  calam: string;
  ngay: string;
  ghichu?: string | null;
  tennhanvien?: string | null;
  tenphong?: string | null;
};

type UserStored = {
  manguoidung?: number;
  tentaikhoan?: string;
  loaitaikhoan?: string;
};

function toYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseYMD(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

/** Thứ Hai đầu tuần (theo ngày anchor). */
function startOfWeekMonday(anchor: Date): Date {
  const d = new Date(anchor);
  d.setHours(12, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function addDays(ymd: string, delta: number): string {
  const d = parseYMD(ymd);
  d.setDate(d.getDate() + delta);
  return toYMD(d);
}

const WEEKDAY_VI = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

function weekdayShortVi(d: Date): string {
  const mondayBased = d.getDay() === 0 ? 6 : d.getDay() - 1;
  return WEEKDAY_VI[mondayBased] ?? '';
}

function formatVNDate(d: Date): string {
  return d.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  });
}

const MyWorkSchedule: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [anchorDate, setAnchorDate] = useState(() => toYMD(new Date()));
  const [manhanvien, setManhanvien] = useState<number | null>(null);
  const [staffName, setStaffName] = useState<string>('');
  const [linkError, setLinkError] = useState<string | null>(null);

  const [rows, setRows] = useState<ScheduleRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      const u: UserStored | null = raw ? JSON.parse(raw) : null;
      const mid = u?.manguoidung;
      if (mid != null && Number.isFinite(Number(mid)) && Number(mid) > 0) {
        setManhanvien(Number(mid));
        setLinkError(null);
      } else {
        setManhanvien(null);
        setLinkError(
          'Tài khoản chưa liên kết hồ sơ nhân viên (mã người dùng). Liên hệ quản trị để gán nhân viên cho tài khoản.'
        );
      }
    } catch {
      setManhanvien(null);
      setLinkError('Không đọc được thông tin đăng nhập.');
    }
  }, []);

  useEffect(() => {
    if (manhanvien == null) return;
    let cancelled = false;
    (async () => {
      try {
        const nv = await NhanVienService.getById(manhanvien);
        if (!cancelled && nv?.hoten) setStaffName(String(nv.hoten));
      } catch {
        if (!cancelled) setStaffName('');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [manhanvien]);

  const range = useMemo(() => {
    const anchor = parseYMD(anchorDate);
    if (viewMode === 'day') {
      const y = toYMD(anchor);
      return { tungay: y, denngay: y };
    }
    const mon = startOfWeekMonday(anchor);
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);
    return { tungay: toYMD(mon), denngay: toYMD(sun) };
  }, [anchorDate, viewMode]);

  const load = useCallback(async () => {
    if (manhanvien == null) {
      setRows([]);
      return;
    }
    setLoading(true);
    setFetchError(null);
    try {
      const data = await LichLamViecService.getCaNhan(
        manhanvien,
        range.tungay,
        range.denngay
      );
      const list = (Array.isArray(data) ? data : []).map((r: Record<string, unknown>) => ({
        id: Number(r.id),
        manhanvien: Number(r.manhanvien),
        maphong: Number(r.maphong),
        calam: String(r.calam ?? ''),
        ngay: String(r.ngay ?? '').slice(0, 10),
        ghichu: r.ghichu != null ? String(r.ghichu) : '',
        tennhanvien: r.tennhanvien != null ? String(r.tennhanvien) : undefined,
        tenphong: r.tenphong != null ? String(r.tenphong) : undefined,
      }));
      setRows(list);
    } catch (e: unknown) {
      const msg =
        typeof e === 'object' && e !== null && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setFetchError(msg || 'Không tải được lịch làm việc.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [manhanvien, range.tungay, range.denngay]);

  useEffect(() => {
    load();
  }, [load]);

  const byDate = useMemo(() => {
    const map = new Map<string, ScheduleRow[]>();
    for (const r of rows) {
      const key = r.ngay.slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => a.calam.localeCompare(b.calam, 'vi'));
    }
    return map;
  }, [rows]);

  const weekDays = useMemo(() => {
    const mon = startOfWeekMonday(parseYMD(anchorDate));
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(mon);
      d.setDate(mon.getDate() + i);
      days.push(d);
    }
    return days;
  }, [anchorDate]);

  const shiftNav = (delta: number) => {
    if (viewMode === 'day') {
      setAnchorDate((d) => addDays(d, delta));
    } else {
      setAnchorDate((d) => addDays(d, delta * 7));
    }
  };

  const goToday = () => setAnchorDate(toYMD(new Date()));

  const handleExportExcel = () => {
    if (!rows.length) return;
    const fileSuffix = range.tungay === range.denngay ? range.tungay : `${range.tungay}_${range.denngay}`;
    const sheetLabel = viewMode === 'week' ? `Tuan ${range.tungay}` : `Ngay ${range.tungay}`;
    exportSchedulesToXlsx(
      rows.map((r) => ({
        ngay: r.ngay,
        tennhanvien: r.tennhanvien,
        manhanvien: r.manhanvien,
        tenphong: r.tenphong,
        maphong: r.maphong,
        calam: r.calam,
        ghichu: r.ghichu,
      })),
      `lich-ca-nhan_${fileSuffix}`,
      sheetLabel
    );
  };

  const renderShiftCard = (r: ScheduleRow) => (
    <div
      key={r.id}
      className="rounded border border-slate-100 bg-slate-50/80 p-3 text-sm shadow-sm hover:border-slate-200 hover:bg-white transition-colors"
    >
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-bold text-slate-800 leading-snug">{r.calam || '—'}</p>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
            <span className="truncate">{r.tenphong || `Phòng #${r.maphong}`}</span>
          </p>
          {r.ghichu ? (
            <p className="text-[11px] text-slate-600 mt-2 flex gap-1 items-start border-t border-slate-100 pt-2">
              <StickyNote size={12} className="shrink-0 mt-0.5 text-amber-600" />
              <span>{r.ghichu}</span>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 text-slate-800">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            Lịch làm việc cá nhân
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Ca làm việc và phòng được phân theo lịch hệ thống — chỉ hiển thị lịch của bạn.
          </p>
          
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded border border-slate-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setViewMode('week')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded text-sm font-bold transition-all ${
                viewMode === 'week'
                  ? 'bg-slate-600 text-white shadow'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <LayoutGrid size={18} />
              Theo tuần
            </button>
            <button
              type="button"
              onClick={() => setViewMode('day')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded text-sm font-bold transition-all ${
                viewMode === 'day'
                  ? 'bg-slate-600 text-white shadow'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Calendar1 size={18} />
              Theo ngày
            </button>
          </div>
        </div>
      </div>

      {linkError && (
        <div className="rounded border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900 font-medium">
          {linkError}
        </div>
      )}

      {manhanvien != null && (
        <div className="bg-white rounded border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => shiftNav(-1)}
              className="p-2.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
              aria-label="Trước"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={() => shiftNav(1)}
              className="p-2.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
              aria-label="Sau"
            >
              <ChevronRight size={22} />
            </button>
            <button
              type="button"
              onClick={goToday}
              className="px-4 py-2.5 rounded border border-slate-200 bg-slate-50 text-slate-800 text-sm font-medium hover:bg-slate-100 transition-colors"
            >
              Hôm nay
            </button>
            <button
              type="button"
              disabled={loading || rows.length === 0}
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2.5 rounded border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              <FileDown size={18} />
              Xuất Excel
            </button>
            <div className="text-sm font-medium text-slate-600 pl-2 border-l border-slate-100 ml-1">
              {viewMode === 'week' ? (
                <>
                  Tuần:{' '}
                  <span className="font-medium text-slate-800">
                    {formatVNDate(parseYMD(range.tungay))}
                  </span>{' '}
                  —{' '}
                  <span className="font-medium text-slate-800">
                    {formatVNDate(parseYMD(range.denngay))}
                  </span>
                </>
              ) : (
                <span className="font-black text-slate-800">{formatVNDate(parseYMD(anchorDate))}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            {loading && (
              <span className="inline-flex items-center gap-2 text-indigo-600">
                <Loader2 className="animate-spin" size={16} />
                Đang tải…
              </span>
            )}
          </div>
        </div>
      )}

      {fetchError && (
        <div className="rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {fetchError}
        </div>
      )}

      {manhanvien != null && !loading && rows.length === 0 && !fetchError && (
        <div className="rounded border border-dashed border-slate-200 bg-slate-50/80 py-16 text-center text-slate-500 text-sm font-medium">
          Không có ca trong {viewMode === 'week' ? 'tuần đã chọn' : 'ngày đã chọn'}.
        </div>
      )}

      {manhanvien != null && viewMode === 'week' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {weekDays.map((d) => {
            const ymd = toYMD(d);
            const list = byDate.get(ymd) ?? [];
            const isToday = ymd === toYMD(new Date());
            return (
              <div
                key={ymd}
                className={`rounded border flex flex-col min-h-[180px] overflow-hidden ${
                  isToday
                    ? 'border-slate-300 bg-slate-50/40 ring-1 ring-slate-100'
                    : 'border-slate-100 bg-white shadow-sm'
                }`}
              >
                <div
                  className={`px-3 py-2.5 border-b text-center ${
                    isToday ? 'bg-slate-600 text-white' : 'bg-slate-50 text-slate-700'
                  }`}
                >
                  <p className="text-sm font-bold uppercase tracking-widest opacity-90">
                    {weekdayShortVi(d)}
                  </p>
                  <p className="text-sm font-bold">{d.getDate()}/{d.getMonth() + 1}</p>
                </div>
                <div className="p-2 space-y-2 flex-1">
                  {list.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-6 font-medium">Trống</p>
                  ) : (
                    list.map(renderShiftCard)
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {manhanvien != null && viewMode === 'day' && (
        <div className="bg-white rounded border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Chi tiết ngày {formatVNDate(parseYMD(anchorDate))}</h3>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {(byDate.get(anchorDate.slice(0, 10)) ?? []).length} ca
            </span>
          </div>
          <div className="p-4 space-y-3 max-h-[min(520px,calc(100vh-22rem))] overflow-y-auto">
            {(byDate.get(anchorDate.slice(0, 10)) ?? []).length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-12 font-medium">Không có ca trong ngày này.</p>
            ) : (
              (byDate.get(anchorDate.slice(0, 10)) ?? []).map(renderShiftCard)
            )}
          </div>
        </div>
      )}

      {manhanvien != null && rows.length > 0 && (
        <div className="bg-white rounded border border-slate-100 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[640px]">
            <thead>
              <tr className="bg-slate-50/80 text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
                <th className="py-4 px-5">Ngày</th>
                <th className="py-4 px-4">Ca</th>
                <th className="py-4 px-4">Phòng</th>
                <th className="py-4 px-5">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rows
                .slice()
                .sort((a, b) => a.ngay.localeCompare(b.ngay) || a.calam.localeCompare(b.calam))
                .map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5 font-medium text-slate-800 whitespace-nowrap">
                      {r.ngay.slice(0, 10)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 text-sm">{r.calam}</td>
                    <td className="py-3.5 px-4 text-slate-600">{r.tenphong || `—`}</td>
                    <td className="py-3.5 px-5 text-slate-500 max-w-xs truncate" title={r.ghichu || ''}>
                      {r.ghichu || '—'}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyWorkSchedule;
