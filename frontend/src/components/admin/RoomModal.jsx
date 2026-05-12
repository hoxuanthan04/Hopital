import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import ChuyenKhoaService from '../../services/chuyenkhoa.service';

const emptyForm = {
  tenphong: '',
  machuyenkhoa: '',
  chucnang: '',
  tang: '',
  khu: '',
  trangthai: 'Đang hoạt động',
  mamayphong: '',
};

const ClinicModal = ({ isOpen, onClose, onSave, initialData = null, mode = 'add' }) => {
  const [formData, setFormData] = useState(emptyForm);
  const [chuyenKhoaList, setChuyenKhoaList] = useState([]);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    ChuyenKhoaService.getAll()
      .then((rows) => {
        if (!cancelled && Array.isArray(rows)) setChuyenKhoaList(rows);
      })
      .catch(() => {
        if (!cancelled) setChuyenKhoaList([]);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  useEffect(() => {
    if (initialData && (mode === 'edit' || mode === 'view')) {
      setFormData({
        maphong: initialData.maphong,
        tenphong: initialData.tenphong ?? '',
        machuyenkhoa:
          initialData.machuyenkhoa != null && initialData.machuyenkhoa !== ''
            ? String(initialData.machuyenkhoa)
            : '',
        chucnang: initialData.chucnang ?? '',
        tang: initialData.tang ?? '',
        khu: initialData.khu ?? '',
        trangthai: initialData.trangthai ?? 'Đang hoạt động',
        mamayphong: initialData.mamayphong ?? '',
      });
    } else {
      setFormData({ ...emptyForm });
    }
  }, [initialData, mode, isOpen]);

  if (!isOpen) return null;

  const isViewMode = mode === 'view';

  const handleChange = (e) => {
    if (isViewMode) return;
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isViewMode) return;
    const payload = {
      tenphong: formData.tenphong,
      chucnang: formData.chucnang,
      tang: formData.tang,
      khu: formData.khu,
      trangthai: formData.trangthai,
      mamayphong: formData.mamayphong,
      machuyenkhoa: formData.machuyenkhoa === '' ? null : Number(formData.machuyenkhoa),
    };
    if (formData.maphong != null) payload.maphong = formData.maphong;
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-7xl rounded-[8px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in slide-in-from-bottom-4 duration-300">
        <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-2xl font-bold text-slate-800">
              {isViewMode ? 'Chi tiết phòng khám' : mode === 'edit' ? 'Cập nhật phòng khám' : 'Thêm mới phòng khám'}
            </h3>
            <p className="text-sm text-slate-500">
              {isViewMode ? `Mã phòng: ${formData.maphong}` : 'Thiết lập thông tin phòng, vị trí và mã quản lý thiết bị'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded transition-all shadow-sm"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">Tên phòng khám</label>
              <input
                disabled={isViewMode}
                required
                name="tenphong"
                value={formData.tenphong}
                onChange={handleChange}
                placeholder="Ví dụ: Phòng Khám 101"
                className="w-full px-4 py-3 border border-slate-100 rounded outline-none transition-all disabled:opacity-70 disabled:bg-slate-100"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">Chuyên khoa (machuyenkhoa)</label>
              <select
                disabled={isViewMode}
                required
                name="machuyenkhoa"
                value={formData.machuyenkhoa}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-100 rounded outline-none cursor-pointer disabled:opacity-70 disabled:bg-slate-100"
              >
                <option value="">— Chọn chuyên khoa —</option>
                {chuyenKhoaList.map((ck) => (
                  <option key={ck.machuyenkhoa} value={String(ck.machuyenkhoa)}>
                    {ck.tenchuyenkhoa}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2"> Chức năng chính</label>
              <input
                disabled={isViewMode}
                required
                name="chucnang"
                value={formData.chucnang}
                onChange={handleChange}
                placeholder="Ví dụ: Khám tổng quát"
                className="w-full px-4 py-3  border border-slate-100 rounded outline-none disabled:opacity-70 disabled:bg-slate-100"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2"> Tầng</label>
              <input
                disabled={isViewMode}
                required
                name="tang"
                value={formData.tang}
                onChange={handleChange}
                placeholder="Ví dụ: 1"
                className="w-full px-4 py-3  border border-slate-100 rounded outline-none disabled:opacity-70 disabled:bg-slate-100"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2"> Khu vực</label>
              <input
                disabled={isViewMode}
                required
                name="khu"
                value={formData.khu}
                onChange={handleChange}
                placeholder="Ví dụ: Khu A"
                className="w-full px-4 py-3  border border-slate-100 rounded outline-none disabled:opacity-70 disabled:bg-slate-100"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2"> Trạng thái</label>
              <select
                disabled={isViewMode}
                name="trangthai"
                value={formData.trangthai}
                onChange={handleChange}
                className="w-full px-4 py-3  border border-slate-100 rounded outline-none cursor-pointer disabled:opacity-70 disabled:bg-slate-100"
              >
                <option value="Đang hoạt động">Đang hoạt động</option>
                <option value="Sẵn sàng">Sẵn sàng</option>
                <option value="Trống">Trống</option>
                <option value="Đang sửa chữa">Đang sửa chữa</option>
              </select>
            </div>

            <div className="space-y-2 md:col-span-3">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2"> Mã máy phòng</label>
              <input
                disabled={isViewMode}
                required
                name="mamayphong"
                value={formData.mamayphong}
                onChange={handleChange}
                placeholder="Ví dụ: MP-101-PC"
                className="w-full px-4 py-3  border border-slate-100 rounded outline-none disabled:opacity-70 disabled:bg-slate-100"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 px-6 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded transition-all active:scale-95"
            >
              {isViewMode ? 'Đóng' : 'Hủy bỏ'}
            </button>
            {!isViewMode && (
              <button
                type="submit"
                className="flex-[2] py-4 px-6 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded shadow-lg shadow-blue-500/25 transition-all active:scale-95"
              >
                {mode === 'edit' ? 'Cập nhật thông tin' : 'Xác nhận thêm phòng khám'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClinicModal;
