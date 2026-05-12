import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Search,
  Plus,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  X,
  Loader2,
  FileDown,
} from 'lucide-react';
import type { Schedule } from '../../../types';
import Pagination from '../../components/admin/Pagination';
import LichLamViecService from '../../services/lichlamviec.service';
import NhanVienService from '../../services/nhanvien.service';
import PhongKhamService from '../../services/phongkham.service';
import { exportSchedulesToXlsx } from '../../utils/exportScheduleExcel';

type NhanVienRow = { manhanvien: number; hoten: string };
type PhongRow = { maphong: number; tenphong: string };

const CA_OPTIONS = [
  'Sáng (07:30 - 11:30)',
  'Chiều (13:30 - 17:30)',
  'Tối (18:00 - 22:00)',
  'Cả ngày',
  'Ca đêm',
];

function toYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseYMD(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

function formatVN(ymd: string): string {
  const [y, m, d] = ymd.split('-');
  if (!y || !m || !d) return ymd;
  return `${d}/${m}/${y}`;
}

function addDays(ymd: string, delta: number): string {
  const d = parseYMD(ymd);
  d.setDate(d.getDate() + delta);
  return toYMD(d);
}

const ITEMS_PER_PAGE = 10;

const Schedules: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(() => toYMD(new Date()));
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [staff, setStaff] = useState<NhanVienRow[]>([]);
  const [rooms, setRooms] = useState<PhongRow[]>([]);
  const [metaLoading, setMetaLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [manhanvien, setManhanvien] = useState('');
  const [maphong, setMaphong] = useState('');
  const [calam, setCalam] = useState(CA_OPTIONS[0]);
  const [ngayForm, setNgayForm] = useState(selectedDate);
  const [ghichu, setGhichu] = useState('');

  const [currentPage, setCurrentPage] = useState(1);

  const loadMeta = useCallback(async () => {
    setMetaLoading(true);
    try {
      const [nv, pk] = await Promise.all([NhanVienService.getAll(), PhongKhamService.getAll()]);
      setStaff(Array.isArray(nv) ? nv : []);
      setRooms(Array.isArray(pk) ? pk : []);
    } catch (e) {
      console.error(e);
      setError('Không tải được danh sách nhân viên hoặc phòng khám.');
    } finally {
      setMetaLoading(false);
    }
  }, []);

  const loadSchedules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await LichLamViecService.getByNgay(selectedDate);
      const list = (Array.isArray(data) ? data : []).map((r: Record<string, unknown>) => ({
        id: Number(r.id),
        manhanvien: Number(r.manhanvien),
        maphong: Number(r.maphong),
        calam: String(r.calam ?? ''),
        ngay: String(r.ngay ?? '').slice(0, 10),
        ghichu: String(r.ghichu ?? ''),
        tennhanvien: r.tennhanvien != null ? String(r.tennhanvien) : undefined,
        tenphong: r.tenphong != null ? String(r.tenphong) : undefined,
      }));
      setRows(list);
    } catch (e: unknown) {
      const msg =
        typeof e === 'object' && e !== null && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setError(msg || 'Không tải được lịch làm việc. Kiểm tra backend và tham số ngày.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const blob = [r.tennhanvien, r.tenphong, r.calam, r.ghichu].filter(Boolean).join(' ').toLowerCase();
      return blob.includes(q);
    });
  }, [rows, search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDate, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);

  const openCreate = () => {
    setEditingId(null);
    setFormError(null);
    setManhanvien(staff[0] ? String(staff[0].manhanvien) : '');
    setMaphong(rooms[0] ? String(rooms[0].maphong) : '');
    setCalam(CA_OPTIONS[0]);
    setNgayForm(selectedDate);
    setGhichu('');
    setModalOpen(true);
  };

  const openEdit = (r: Schedule) => {
    setEditingId(r.id);
    setFormError(null);
    setManhanvien(String(r.manhanvien));
    setMaphong(String(r.maphong));
    setCalam(r.calam || CA_OPTIONS[0]);
    setNgayForm(r.ngay.slice(0, 10));
    setGhichu(r.ghichu || '');
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const mid = Number(manhanvien);
    const pid = Number(maphong);
    if (!mid || !pid || !calam.trim() || !ngayForm) {
      setFormError('Vui lòng chọn nhân viên, phòng và ca làm việc.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        manhanvien: mid,
        maphong: pid,
        calam: calam.trim(),
        ngay: ngayForm,
        ghichu: ghichu.trim() || null,
      };
      if (editingId != null) {
        await LichLamViecService.update(editingId, payload);
      } else {
        await LichLamViecService.create(payload);
      }
      setModalOpen(false);
      await loadSchedules();
      if (ngayForm !== selectedDate) setSelectedDate(ngayForm);
    } catch (err: unknown) {
      const msg =
        typeof err === 'object' && err !== null && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setFormError(msg || 'Lưu thất bại. Kiểm tra dữ liệu và ràng buộc CSDL.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (r: Schedule) => {
    if (!window.confirm(`Xóa lịch: ${r.tennhanvien || 'Nhân viên'} — ${r.calam}?`)) return;
    try {
      await LichLamViecService.delete(r.id);
      await loadSchedules();
    } catch (err: unknown) {
      const msg =
        typeof err === 'object' && err !== null && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      alert(msg || 'Xóa không thành công.');
    }
  };

  const handleExportExcel = () => {
    if (!filtered.length) return;
    exportSchedulesToXlsx(
      filtered.map((r) => ({
        ngay: r.ngay,
        tennhanvien: r.tennhanvien,
        manhanvien: r.manhanvien,
        tenphong: r.tenphong,
        maphong: r.maphong,
        calam: r.calam,
        ghichu: r.ghichu,
      })),
      `lich-lam-viec_${selectedDate}`,
      `Ngay ${selectedDate}`
    );
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">{error}</div>
      )}

      <div className="bg-white p-4 rounded shadow-sm border border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-slate-50 rounded p-1 border border-slate-100">
            <button
              type="button"
              aria-label="Ngày trước"
              className="p-2 hover:bg-white hover:shadow-sm rounded transition-all text-slate-500"
              onClick={() => setSelectedDate((d) => addDays(d, -1))}
            >
              <ChevronLeft size={18} />
            </button>
            <div className="px-4 flex items-center gap-2 font-bold text-slate-700 min-w-[200px] justify-center">
              <CalendarIcon size={16} className="text-slate-500 shrink-0" />
              <span className="text-center">
                {formatVN(selectedDate)}
                <span className="block text-xs font-normal text-slate-500">{selectedDate}</span>
              </span>
            </div>
            <button
              type="button"
              aria-label="Ngày sau"
              className="p-2 hover:bg-white hover:shadow-sm rounded transition-all text-slate-500"
              onClick={() => setSelectedDate((d) => addDays(d, 1))}
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <button
            type="button"
            className="text-sm font-bold text-slate-600 hover:underline"
            onClick={() => setSelectedDate(toYMD(new Date()))}
          >
            Hôm nay
          </button>
        </div>

        <div className="flex flex-1 max-w-md relative min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm nhân viên, phòng, ca hoặc ghi chú..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-transparent focus:border-amber-500 rounded outline-none text-sm transition-all"
          />
        </div>
        <button
          type="button"
          disabled={loading || filtered.length === 0}
          onClick={handleExportExcel}
          className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white text-slate-700 rounded font-bold hover:bg-slate-50 transition-all disabled:opacity-50 disabled:pointer-events-none shrink-0"
        >
          <FileDown size={18} />
          Xuất Excel
        </button>
        <button
          type="button"
          disabled={metaLoading || !staff.length || !rooms.length}
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
        >
          <Plus size={20} />
          Phân ca làm việc
        </button>
      </div>

      <div className="bg-white rounded shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[11px] font-bold uppercase tracking-widest border-b border-slate-100">
                <th className="py-4 px-6">Nhân viên & Ca trực</th>
                <th className="py-4 px-4">Phòng làm việc</th>
                <th className="py-4 px-4 text-center">Thời gian</th>
                <th className="py-4 px-4">Ghi chú công việc</th>
                <th className="py-4 px-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-500">
                    <Loader2 className="inline animate-spin mr-2" size={20} />
                    Đang tải lịch...
                  </td>
                </tr>
              ) : (
                currentItems.map((sched) => (
                  <tr key={sched.id} className="hover:bg-amber-50/30 transition-colors group">
                    <td className="py-2 px-6">
                      <p className="font-medium text-slate-600 leading-none mb-1">
                        {sched.tennhanvien || `Mã NV ${sched.manhanvien}`}
                      </p>
                    </td>
                    <td className="py-2 px-4">
                      <span className="text-slate-600 text-sm ">
                        {sched.tenphong || `Phòng #${sched.maphong}`}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 text-slate-700 text-sm ">
                        {sched.calam}
                      </span>
                    </td>
                    <td className="py-2 px-4">
                      <p className="text-sm text-slate-500 max-w-[240px]">
                        {sched.ghichu?.trim() ? sched.ghichu : 'Không có ghi chú'}
                      </p>
                    </td>
                    <td className="py-2 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          title="Sửa"
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                          onClick={() => openEdit(sched)}
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          type="button"
                          title="Xóa"
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all"
                          onClick={() => handleDelete(sched)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length > 0 && (
          <Pagination
            totalItems={filtered.length}
            itemsPerPage={ITEMS_PER_PAGE}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl py-12 text-center text-slate-400">
          <CalendarIcon size={48} className="mx-auto mb-4 opacity-20" />
          <p className="font-medium">
            {search.trim()
              ? 'Không có dòng lịch nào khớp bộ lọc.'
              : 'Chưa có lịch trực nào được sắp xếp cho ngày này.'}
          </p>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40" onClick={closeModal}>
          <div
            className="bg-white rounded shadow-xl max-w-md w-full p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="schedule-modal-title"
          >
            <div className="flex justify-between items-start gap-2">
              <h2 id="schedule-modal-title" className="text-lg font-bold text-slate-800">
                {editingId != null ? 'Sửa lịch làm việc' : 'Phân ca làm việc'}
              </h2>
              <button
                type="button"
                className="p-1 rounded text-slate-400 hover:bg-slate-100"
                onClick={closeModal}
                aria-label="Đóng"
              >
                <X size={20} />
              </button>
            </div>

            {formError && <p className="text-sm text-rose-600 bg-rose-50 rounded px-3 py-2">{formError}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ngày làm việc</label>
                <input
                  type="date"
                  required
                  value={ngayForm}
                  onChange={(e) => setNgayForm(e.target.value)}
                  className="w-full border border-slate-200 rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nhân viên</label>
                <select
                  required
                  value={manhanvien}
                  onChange={(e) => setManhanvien(e.target.value)}
                  className="w-full border border-slate-200 rounded px-3 py-2 text-sm"
                >
                  {staff.map((nv) => (
                    <option key={nv.manhanvien} value={nv.manhanvien}>
                      {nv.hoten} (#{nv.manhanvien})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phòng khám</label>
                <select
                  required
                  value={maphong}
                  onChange={(e) => setMaphong(e.target.value)}
                  className="w-full border border-slate-200 rounded px-3 py-2 text-sm"
                >
                  {rooms.map((pk) => (
                    <option key={pk.maphong} value={pk.maphong}>
                      {pk.tenphong} (#{pk.maphong})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ca làm việc</label>
                <select
                  required
                  value={calam}
                  onChange={(e) => setCalam(e.target.value)}
                  className="w-full border border-slate-200 rounded px-3 py-2 text-sm"
                >
                  {CA_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-400 mt-1">Giá trị lưu tối đa 50 ký tự theo CSDL.</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ghi chú</label>
                <textarea
                  value={ghichu}
                  onChange={(e) => setGhichu(e.target.value)}
                  rows={2}
                  maxLength={200}
                  placeholder="VD: Trực chuyên khoa, hỗ trợ ca mổ..."
                  className="w-full border border-slate-200 rounded px-3 py-2 text-sm resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-60 inline-flex items-center gap-2"
                >
                  {saving && <Loader2 className="animate-spin" size={16} />}
                  {editingId != null ? 'Cập nhật' : 'Lưu lịch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedules;
