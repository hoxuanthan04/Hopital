import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Calendar,
  Printer,
  AlertCircle,
  X,
  Plus,
  Eye,
  Banknote,
  Loader2,
  Wallet,
} from 'lucide-react';
import Pagination from '../../components/admin/Pagination';
import HoaDonService from '../../services/hoadon.service';
import { getBenhNhan } from '../../services/benhnhanApi';

const ITEMS_PER_PAGE = 8;

type InvoiceRow = {
  mahoadon: number;
  mabenhnhan: number;
  danhsachdichvu?: string | null;
  sotienbaohiemchitra?: number | string | null;
  thuctracuabenhnhan?: number | string | null;
  tongtien?: number | string | null;
  hoten?: string | null;
  socccd?: string | null;
};

type ChiTietRow = {
  id: number;
  madichvu?: number | null;
  soluong?: number | null;
  dongia?: number | string | null;
  thanhtien?: number | string | null;
  tendichvu?: string | null;
};

type BenhNhanOpt = { mabenhnhan: number; hoten?: string; socccd?: string };

const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const fmtVnd = (v: unknown) =>
  `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(num(v))} đ`;

/** Đã thu đủ: BHYT + tiền đã thu từ BN (tạm ứng + PayOS / thủ công) ≥ tổng. */
function tinhTrangThai(h: InvoiceRow): 'Đã thanh toán' | 'Chưa thanh toán' {
  const t = num(h.tongtien);
  const b = num(h.sotienbaohiemchitra);
  const p = num(h.thuctracuabenhnhan);
  if (t <= 0) return 'Chưa thanh toán';
  return b + p >= t - 0.5 ? 'Đã thanh toán' : 'Chưa thanh toán';
}

/** Thực thu còn phải thu = tổng − BHYT − tạm ứng (tạm ứng lưu ở thuctracuabenhnhan trước khi thu đủ). */
function conPhaiThuBenhNhan(h: InvoiceRow) {
  return Math.max(0, Math.round(num(h.tongtien) - num(h.sotienbaohiemchitra) - num(h.thuctracuabenhnhan)));
}

const InvoiceManagement: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const [detailId, setDetailId] = useState<number | null>(null);
  const [detailHeader, setDetailHeader] = useState<InvoiceRow | null>(null);
  const [detailRows, setDetailRows] = useState<ChiTietRow[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [patients, setPatients] = useState<BenhNhanOpt[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    mabenhnhan: '',
    tongtien: '',
    sotienbaohiemchitra: '',
    tamung: '',
    danhsachdichvu: '',
  });
  const [createMode, setCreateMode] = useState<'manual' | 'auto'>('manual');
  const [hosoChoTT, setHosoChoTT] = useState<
    { mahosokham: number; mabenhnhan: number; hoten?: string | null }[]
  >([]);
  const [autoMahosokham, setAutoMahosokham] = useState('');
  const [autoPreview, setAutoPreview] = useState<Record<string, unknown> | null>(null);
  const [autoBh, setAutoBh] = useState('0');
  const [autoTamung, setAutoTamung] = useState('0');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [payosLoadingId, setPayosLoadingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await HoaDonService.getAll();
      setInvoices(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError('Không tải được danh sách hóa đơn. Kiểm tra API /api/hoadon.');
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const p = searchParams.get('payos');
    if (p === 'return') {
      void load();
      window.alert(
        'Đã quay lại từ PayOS. Nếu thanh toán thành công, hệ thống cập nhật qua webhook trong vài giây — bấm «Làm mới» nếu chưa thấy «Đã thu».'
      );
      const next = new URLSearchParams(searchParams);
      next.delete('payos');
      setSearchParams(next, { replace: true });
    } else if (p === 'cancel') {
      window.alert('Thanh toán PayOS đã bị hủy.');
      const next = new URLSearchParams(searchParams);
      next.delete('payos');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams, load]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return invoices.filter((inv) => {
      const st = tinhTrangThai(inv);
      if (statusFilter === 'paid' && st !== 'Đã thanh toán') return false;
      if (statusFilter === 'unpaid' && st !== 'Chưa thanh toán') return false;
      if (!q) return true;
      const blob = [
        inv.mahoadon,
        inv.mabenhnhan,
        inv.hoten,
        inv.socccd,
        inv.danhsachdichvu,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return blob.includes(q);
    });
  }, [invoices, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const sliceStart = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageRows = filtered.slice(sliceStart, sliceStart + ITEMS_PER_PAGE);

  const chuaThuCount = useMemo(
    () => invoices.filter((i) => tinhTrangThai(i) === 'Chưa thanh toán').length,
    [invoices]
  );

  const openDetail = async (inv: InvoiceRow) => {
    setDetailId(inv.mahoadon);
    setDetailHeader(inv);
    setDetailLoading(true);
    setDetailRows([]);
    try {
      const rows = await HoaDonService.getChiTiet(inv.mahoadon);
      setDetailRows(Array.isArray(rows) ? rows : []);
    } catch {
      setDetailRows([]);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setDetailId(null);
    setDetailHeader(null);
    setDetailRows([]);
  };

  const openCreate = async () => {
    setCreateMode('manual');
    setForm({
      mabenhnhan: '',
      tongtien: '',
      sotienbaohiemchitra: '0',
      tamung: '0',
      danhsachdichvu: '',
    });
    setAutoMahosokham('');
    setAutoPreview(null);
    setAutoBh('0');
    setAutoTamung('0');
    setCreateOpen(true);
    try {
      const [list, hosoList] = await Promise.all([
        getBenhNhan(),
        HoaDonService.getHosoChoThanhToan(),
      ]);
      setPatients(Array.isArray(list) ? list : []);
      setHosoChoTT(Array.isArray(hosoList) ? hosoList : []);
    } catch {
      setPatients([]);
      setHosoChoTT([]);
    }
  };

  useEffect(() => {
    if (!createOpen || createMode !== 'auto') return;
    const id = Number(autoMahosokham);
    if (!Number.isFinite(id) || id <= 0) {
      setAutoPreview(null);
      return;
    }
    let cancelled = false;
    setPreviewLoading(true);
    void HoaDonService.previewHosoInvoice(id)
      .then((d) => {
        if (!cancelled) setAutoPreview(d as Record<string, unknown>);
      })
      .catch(() => {
        if (!cancelled) setAutoPreview(null);
      })
      .finally(() => {
        if (!cancelled) setPreviewLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [createOpen, createMode, autoMahosokham]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const mid = Number(form.mabenhnhan);
    const tong = num(form.tongtien);
    const bh = num(form.sotienbaohiemchitra);
    const tamung = num(form.tamung);
    if (!mid || tong <= 0) {
      alert('Chọn bệnh nhân và nhập tổng tiền hợp lệ.');
      return;
    }
    if (bh > tong) {
      alert('BHYT không được lớn hơn tổng tiền.');
      return;
    }
    if (tamung > tong - bh) {
      alert('Tạm ứng không được vượt quá (tổng − BHYT).');
      return;
    }
    setSaving(true);
    try {
      await HoaDonService.create({
        mabenhnhan: mid,
        danhsachdichvu: form.danhsachdichvu.trim() || '—',
        sotienbaohiemchitra: bh,
        thuctracuabenhnhan: tamung,
        tongtien: tong,
      });
      setCreateOpen(false);
      await load();
    } catch (err: unknown) {
      const msg =
        typeof err === 'object' && err !== null && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      alert(msg || 'Tạo hóa đơn thất bại.');
    } finally {
      setSaving(false);
    }
  };

  const handleAutoCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hid = Number(autoMahosokham);
    const bh = num(autoBh);
    const tamung = num(autoTamung);
    if (!hid) {
      alert('Chọn hồ sơ khám bệnh.');
      return;
    }
    const tong = num(autoPreview?.tongtien);
    if (autoPreview && bh > tong) {
      alert('BHYT không được lớn hơn tổng hóa đơn.');
      return;
    }
    if (autoPreview && tamung > tong - bh) {
      alert('Tạm ứng không được vượt quá (tổng − BHYT).');
      return;
    }
    setSaving(true);
    try {
      await HoaDonService.createFromHoSo({
        mahosokham: hid,
        sotienbaohiemchitra: bh,
        tamung,
      });
      setCreateOpen(false);
      await load();
    } catch (err: unknown) {
      const msg =
        typeof err === 'object' && err !== null && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      alert(msg || 'Tạo hóa đơn tự động thất bại.');
    } finally {
      setSaving(false);
    }
  };

  const openPayosCheckout = async (inv: InvoiceRow) => {
    if (tinhTrangThai(inv) === 'Đã thanh toán') return;
    const tong = num(inv.tongtien);
    const bh = num(inv.sotienbaohiemchitra);
    const daThu = num(inv.thuctracuabenhnhan);
    const canThu = Math.max(0, Math.round(tong - bh - daThu));
    if (canThu <= 0) {
      window.alert('Hóa đơn không còn số tiền cần thu qua PayOS.');
      return;
    }
    setPayosLoadingId(inv.mahoadon);
    try {
      const data = await HoaDonService.createPayosLink(inv.mahoadon);
      const url = data?.checkoutUrl as string | undefined;
      if (!url) {
        window.alert('PayOS không trả về link thanh toán.');
        return;
      }
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err: unknown) {
      const msg =
        typeof err === 'object' && err !== null && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      window.alert(msg || 'Không tạo được link PayOS. Kiểm tra cấu hình backend và bảng payos_payment_pending.');
    } finally {
      setPayosLoadingId(null);
    }
  };

  const markPaid = async (inv: InvoiceRow) => {
    if (tinhTrangThai(inv) === 'Đã thanh toán') return;
    const tong = num(inv.tongtien);
    const bh = num(inv.sotienbaohiemchitra);
    const thu = Math.max(0, Math.round(tong - bh));
    if (!window.confirm(`Ghi nhận đã thu đủ phần bệnh nhân ${fmtVnd(thu)} (hóa đơn #${inv.mahoadon})?`)) return;
    try {
      await HoaDonService.update(inv.mahoadon, {
        mabenhnhan: inv.mabenhnhan,
        danhsachdichvu: inv.danhsachdichvu ?? '',
        sotienbaohiemchitra: bh,
        thuctracuabenhnhan: thu,
        tongtien: tong,
      });
      await load();
      if (detailId === inv.mahoadon && detailHeader) {
        const updated = await HoaDonService.getById(inv.mahoadon);
        setDetailHeader(updated as InvoiceRow);
      }
    } catch (err: unknown) {
      const msg =
        typeof err === 'object' && err !== null && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      alert(msg || 'Cập nhật thất bại.');
    }
  };

  const handleDelete = async (inv: InvoiceRow) => {
    if (!window.confirm(`Xóa hóa đơn #${inv.mahoadon}? Thao tác không hoàn tác.`)) return;
    try {
      await HoaDonService.delete(inv.mahoadon);
      closeDetail();
      await load();
    } catch (err: unknown) {
      const msg =
        typeof err === 'object' && err !== null && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      alert(msg || 'Xóa thất bại (có thể còn ràng buộc dữ liệu).');
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">{error}</div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Quản lý thanh toán</h2>
          <p className="text-sm text-slate-500 font-medium">
            Hóa đơn <span className="font-mono">hoadonthanhtoan</span>, chi tiết{' '}
            <span className="font-mono">hoadon_dichvu</span>. PayOS: webhook công khai{' '}
            <span className="font-mono">POST /api/payos/webhook</span> (đăng ký trên my.payos.vn).
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow hover:bg-indigo-700"
        >
          <Plus size={18} />
          Tạo hóa đơn
        </button>
      </div>

      <div className="bg-white p-4 rounded shadow-sm border border-slate-100 flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm mã hóa đơn, tên hoặc mã bệnh nhân..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded outline-none transition-all text-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'paid' | 'unpaid')}
            className="flex items-center gap-2 px-5 py-3 border border-slate-100 text-slate-600 font-bold rounded hover:bg-slate-50 text-sm bg-white"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="paid">Đã thanh toán</option>
            <option value="unpaid">Chưa thanh toán</option>
          </select>
          <button
            type="button"
            onClick={() => load()}
            className="flex items-center gap-2 px-5 py-3 border border-slate-100 text-slate-500 font-bold rounded hover:bg-slate-50 text-sm"
          >
            <Calendar size={18} /> Làm mới
          </button>
        </div>
      </div>

      <div className="bg-white rounded shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[11px] font-bold uppercase tracking-widest border-b border-slate-100">
                <th className="py-5 px-8">Hóa đơn</th>
                <th className="py-5 px-4">Bệnh nhân</th>
                <th className="py-5 px-4 text-right">Tổng tiền</th>
                <th className="py-5 px-4 text-right">BHYT</th>
                <th className="py-5 px-4 text-right">
                  <span className="block">Thực thu</span>
                  <span className="block normal-case font-normal text-[9px] text-slate-400 tracking-normal">
                    (còn BN)
                  </span>
                </th>
                <th className="py-5 px-4 text-center">Trạng thái</th>
                <th className="py-5 px-8 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Loader2 className="inline animate-spin mr-2" size={20} />
                    Đang tải...
                  </td>
                </tr>
              ) : (
                pageRows.map((inv) => {
                  const st = tinhTrangThai(inv);
                  const bh = num(inv.sotienbaohiemchitra);
                  const conLai = conPhaiThuBenhNhan(inv);
                  return (
                    <tr key={inv.mahoadon} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="py-5 px-8">
                        <span className="text-sm font-black text-slate-800">#{inv.mahoadon}</span>
                        <p className="text-[10px] text-slate-400 font-bold">Hóa đơn thanh toán</p>
                      </td>
                      <td className="py-5 px-4">
                        <div className="font-bold text-slate-700 text-sm">{inv.hoten || '—'}</div>
                        <div className="text-sm text-slate-400">Mã BN: {inv.mabenhnhan}</div>
                      </td>
                      <td className="py-5 px-4 text-right font-medium text-slate-600 text-sm">{fmtVnd(inv.tongtien)}</td>
                      <td className="py-5 px-4 text-right font-bold text-emerald-600 text-sm">
                        {bh > 0 ? `−${fmtVnd(bh)}` : fmtVnd(0)}
                      </td>
                      <td className="py-5 px-4 text-right font-black text-slate-800 text-sm">{fmtVnd(conLai)}</td>
                      <td className="py-5 px-4 text-center">
                        <span
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold tracking-tight ${
                            st === 'Đã thanh toán'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                              : 'bg-amber-50 text-amber-900 border border-amber-100'
                          }`}
                        >
                          {st === 'Đã thanh toán' ? 'Đã thu' : 'Chờ thu'}
                        </span>
                      </td>
                      <td className="py-5 px-8 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            title="Chi tiết"
                            onClick={() => openDetail(inv)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                          >
                            <Eye size={18} />
                          </button>
                          {st === 'Chưa thanh toán' && (
                            <>
                              <button
                                type="button"
                                title="Thanh toán PayOS (link / QR)"
                                onClick={() => openPayosCheckout(inv)}
                                disabled={payosLoadingId === inv.mahoadon}
                                className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-all disabled:opacity-50"
                              >
                                {payosLoadingId === inv.mahoadon ? (
                                  <Loader2 className="animate-spin" size={18} />
                                ) : (
                                  <Wallet size={18} />
                                )}
                              </button>
                              <button
                                type="button"
                                title="Ghi nhận thanh toán"
                                onClick={() => markPaid(inv)}
                                className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                              >
                                <Banknote size={18} />
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            title="In (xem trước cửa sổ in)"
                            onClick={() => window.print()}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                          >
                            <Printer size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length === 0 && (
          <div className="p-12 text-center text-slate-400 text-sm">Không có hóa đơn phù hợp.</div>
        )}
        {!loading && filtered.length > 0 && (
          <Pagination
            totalItems={filtered.length}
            itemsPerPage={ITEMS_PER_PAGE}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {chuaThuCount > 0 && (
        <div className="bg-amber-50 border border-amber-100 p-4 rounded flex items-center gap-3">
          <AlertCircle className="text-amber-600 shrink-0" size={20} />
          <p className="text-xs text-amber-800 font-medium">
            Có <b>{chuaThuCount}</b> hóa đơn <b>chưa thanh toán đủ</b>. Dùng <b>PayOS</b> (ví điện tử / QR), nút{' '}
            <b>thu tiền</b> thủ công, hoặc chỉnh trong chi tiết.
          </p>
        </div>
      )}

      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40" onClick={() => !saving && setCreateOpen(false)}>
          <div
            className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Tạo hóa đơn thanh toán</h3>
              <button type="button" className="p-1 text-slate-400 hover:bg-slate-100 rounded" onClick={() => !saving && setCreateOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
              <button
                type="button"
                className={`flex-1 py-2 text-xs font-bold rounded-md ${createMode === 'manual' ? 'bg-white shadow text-indigo-700' : 'text-slate-500'}`}
                onClick={() => setCreateMode('manual')}
              >
                Nhập tay
              </button>
              <button
                type="button"
                className={`flex-1 py-2 text-xs font-bold rounded-md ${createMode === 'auto' ? 'bg-white shadow text-indigo-700' : 'text-slate-500'}`}
                onClick={() => setCreateMode('auto')}
              >
                Tự động từ hồ sơ
              </button>
            </div>

            {createMode === 'manual' ? (
              <form onSubmit={handleCreateSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Bệnh nhân</label>
                  <select
                    required
                    value={form.mabenhnhan}
                    onChange={(e) => setForm((f) => ({ ...f, mabenhnhan: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">— Chọn —</option>
                    {patients.map((p) => (
                      <option key={p.mabenhnhan} value={p.mabenhnhan}>
                        {p.hoten} (#{p.mabenhnhan})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tổng tiền (VNĐ)</label>
                  <input
                    required
                    type="number"
                    min={1}
                    value={form.tongtien}
                    onChange={(e) => setForm((f) => ({ ...f, tongtien: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">BHYT chi trả (VNĐ)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.sotienbaohiemchitra}
                    onChange={(e) => setForm((f) => ({ ...f, sotienbaohiemchitra: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tạm ứng (VNĐ)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.tamung}
                    onChange={(e) => setForm((f) => ({ ...f, tamung: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div className="rounded-lg border border-indigo-100 bg-indigo-50/60 px-3 py-2 text-sm">
                  <span className="text-slate-600">Thực thu (còn BN): </span>
                  <b className="text-indigo-900">
                    {fmtVnd(Math.max(0, num(form.tongtien) - num(form.sotienbaohiemchitra) - num(form.tamung)))}
                  </b>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Danh sách dịch vụ (mô tả)</label>
                  <textarea
                    rows={2}
                    value={form.danhsachdichvu}
                    onChange={(e) => setForm((f) => ({ ...f, danhsachdichvu: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none"
                    placeholder="VD: Khám nội, Xét nghiệm máu..."
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg" onClick={() => setCreateOpen(false)} disabled={saving}>
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg disabled:opacity-60 inline-flex items-center gap-2"
                  >
                    {saving && <Loader2 className="animate-spin" size={16} />}
                    Lưu
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleAutoCreateSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hồ sơ (Chờ thanh toán)</label>
                  <select
                    required
                    value={autoMahosokham}
                    onChange={(e) => setAutoMahosokham(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">— Chọn hồ sơ —</option>
                    {hosoChoTT.map((h) => (
                      <option key={h.mahosokham} value={h.mahosokham}>
                        #{h.mahosokham} · BN #{h.mabenhnhan}
                        {h.hoten ? ` · ${h.hoten}` : ''}
                      </option>
                    ))}
                  </select>
                  {hosoChoTT.length === 0 && (
                    <p className="text-xs text-amber-700 mt-1">Không có hồ sơ «Chờ thanh toán». Hoàn tất khám trước.</p>
                  )}
                </div>
                {previewLoading && (
                  <p className="text-xs text-slate-500 flex items-center gap-2">
                    <Loader2 className="animate-spin" size={14} /> Đang tính...
                  </p>
                )}
                {autoPreview && !previewLoading && (
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Cận lâm sàng</span>
                      <b>{fmtVnd(autoPreview.tong_canlamsang)}</b>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Thuốc (đơn)</span>
                      <b>{fmtVnd(autoPreview.tong_thuoc)}</b>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tiền khám</span>
                      <b>{fmtVnd(autoPreview.tien_kham)}</b>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-2 mt-2 font-bold text-slate-800">
                      <span>Tổng hóa đơn</span>
                      <span>{fmtVnd(autoPreview.tongtien)}</span>
                    </div>
                    {autoPreview.da_co_hoadon_mahoadon != null &&
                      Number(autoPreview.da_co_hoadon_mahoadon) > 0 && (
                      <p className="text-amber-800 font-medium pt-1">
                        Đã có hóa đơn #{String(autoPreview.da_co_hoadon_mahoadon)} cho hồ sơ này.
                      </p>
                    )}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">BHYT chi trả (VNĐ)</label>
                  <input
                    type="number"
                    min={0}
                    value={autoBh}
                    onChange={(e) => setAutoBh(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tạm ứng (VNĐ)</label>
                  <input
                    type="number"
                    min={0}
                    value={autoTamung}
                    onChange={(e) => setAutoTamung(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                {autoPreview && (
                  <div className="rounded-lg border border-indigo-100 bg-indigo-50/60 px-3 py-2 text-sm">
                    <span className="text-slate-600">Thực thu (còn BN): </span>
                    <b className="text-indigo-900">
                      {fmtVnd(
                        Math.max(
                          0,
                          Math.round(
                            num(autoPreview.tongtien) - num(autoBh) - num(autoTamung)
                          )
                        )
                      )}
                    </b>
                  </div>
                )}
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg" onClick={() => setCreateOpen(false)} disabled={saving}>
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={
                      saving ||
                      !autoPreview ||
                      Number(autoPreview.da_co_hoadon_mahoadon) > 0
                    }
                    className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg disabled:opacity-60 inline-flex items-center gap-2"
                  >
                    {saving && <Loader2 className="animate-spin" size={16} />}
                    Tạo hóa đơn
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {detailId != null && detailHeader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40" onClick={closeDetail}>
          <div
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex justify-between items-start gap-2">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Hóa đơn #{detailHeader.mahoadon}</h3>
                <p className="text-sm text-slate-500">
                  {detailHeader.hoten} · Mã BN {detailHeader.mabenhnhan} · {tinhTrangThai(detailHeader)}
                </p>
              </div>
              <button type="button" className="p-1 text-slate-400 hover:bg-slate-100 rounded" onClick={closeDetail}>
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm border border-slate-100 rounded-lg p-3 bg-slate-50">
              <div>
                <span className="text-slate-500">Tổng:</span> <b>{fmtVnd(detailHeader.tongtien)}</b>
              </div>
              <div>
                <span className="text-slate-500">BHYT:</span> <b>{fmtVnd(detailHeader.sotienbaohiemchitra)}</b>
              </div>
              <div>
                <span className="text-slate-500">Đã thu / tạm ứng BN:</span>{' '}
                <b>{fmtVnd(detailHeader.thuctracuabenhnhan)}</b>
              </div>
              <div>
                <span className="text-slate-500">Thực thu (còn BN):</span>{' '}
                <b>{fmtVnd(conPhaiThuBenhNhan(detailHeader))}</b>
              </div>
              <div className="col-span-2 text-slate-600">
                <span className="text-slate-500">Mô tả:</span> {detailHeader.danhsachdichvu || '—'}
              </div>
            </div>
            <h4 className="text-sm font-bold text-slate-700">Chi tiết dịch vụ (hoadon_dichvu)</h4>
            {detailLoading ? (
              <p className="text-sm text-slate-500">Đang tải...</p>
            ) : detailRows.length === 0 ? (
              <p className="text-sm text-slate-400 italic">Chưa có dòng chi tiết trong bảng hoadon_dichvu.</p>
            ) : (
              <table className="w-full text-left text-sm border border-slate-100 rounded-lg overflow-hidden">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                  <tr>
                    <th className="px-3 py-2">Dịch vụ</th>
                    <th className="px-3 py-2 text-right">SL</th>
                    <th className="px-3 py-2 text-right">Đơn giá</th>
                    <th className="px-3 py-2 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {detailRows.map((r) => (
                    <tr key={r.id}>
                      <td className="px-3 py-2">{r.tendichvu || `DV #${r.madichvu ?? ''}`}</td>
                      <td className="px-3 py-2 text-right">{r.soluong ?? '—'}</td>
                      <td className="px-3 py-2 text-right">{fmtVnd(r.dongia)}</td>
                      <td className="px-3 py-2 text-right font-medium">{fmtVnd(r.thanhtien)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="flex flex-wrap justify-end gap-2 pt-2 border-t border-slate-100">
              {tinhTrangThai(detailHeader) === 'Chưa thanh toán' && (
                <>
                  <button
                    type="button"
                    onClick={() => openPayosCheckout(detailHeader)}
                    disabled={payosLoadingId === detailHeader.mahoadon}
                    className="px-4 py-2 text-sm font-bold text-white bg-sky-600 rounded-lg hover:bg-sky-700 disabled:opacity-60 inline-flex items-center gap-2"
                  >
                    {payosLoadingId === detailHeader.mahoadon ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <Wallet size={16} />
                    )}
                    PayOS
                  </button>
                  <button
                    type="button"
                    onClick={() => markPaid(detailHeader)}
                    className="px-4 py-2 text-sm font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
                  >
                    Ghi nhận thanh toán đủ
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => handleDelete(detailHeader)}
                className="px-4 py-2 text-sm font-bold text-rose-700 bg-rose-50 rounded-lg hover:bg-rose-100"
              >
                Xóa hóa đơn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceManagement;
