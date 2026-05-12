import React, { useState } from 'react';
import { X } from 'lucide-react';

export type NewBenhNhanPayload = {
  hoten: string;
  gioitinh: string;
  namsinh: number | null;
  socccd: string;
  dienthoai: string;
  mabhyt: string | null;
  quoctich: string | null;
  dantoc: string | null;
  diachi: string | null;
  email: string | null;
  nghenghiep: string | null;
};

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: NewBenhNhanPayload) => Promise<void>;
}

const emptyForm = {
  hoten: '',
  namsinh: '',
  gioitinh: 'Nam',
  socccd: '',
  dienthoai: '',
  mabhyt: '',
  quoctich: 'Việt Nam',
  dantoc: 'Kinh',
  diachi: '',
  email: '',
  nghenghiep: '',
};

const AddPatientModal: React.FC<AddPatientModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const buildPayload = (): NewBenhNhanPayload => {
    const trim = (s: string) => s.trim();
    const n = formData.namsinh.trim();
    return {
      hoten: trim(formData.hoten),
      gioitinh: formData.gioitinh,
      namsinh: n === '' ? null : Number(n),
      socccd: trim(formData.socccd),
      dienthoai: trim(formData.dienthoai),
      mabhyt: trim(formData.mabhyt) || null,
      quoctich: trim(formData.quoctich) || null,
      dantoc: trim(formData.dantoc) || null,
      diachi: trim(formData.diachi) || null,
      email: trim(formData.email) || null,
      nghenghiep: trim(formData.nghenghiep) || null,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const payload = buildPayload();
    if (!payload.hoten) {
      setError('Vui lòng nhập họ tên bệnh nhân.');
      return;
    }
    if (!payload.socccd) {
      setError('Vui lòng nhập số căn cước công dân.');
      return;
    }
    if (!payload.dienthoai) {
      setError('Vui lòng nhập số điện thoại.');
      return;
    }
    setLoading(true);
    try {
      await onSubmit(payload);
      setFormData(emptyForm);
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Không thể thêm bệnh nhân. Vui lòng thử lại.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError('');
      onClose();
    }
  };

  return (
    <div
      style={{ marginTop: '0px' }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-white w-full max-w-6xl rounded-[8px] shadow-2xl flex flex-col animate-in zoom-in slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto">
        <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div>
            <h3 className="text-2xl font-bold text-slate-800">Thêm mới bệnh nhân</h3>
            <p className="text-sm text-slate-500 mt-2">
              Số CCCD và số điện thoại là bắt buộc. Hệ thống tự tạo tài khoản loại <strong>client</strong>: đăng nhập
              = số CCCD, mật khẩu = số điện thoại.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded transition-all shadow-sm"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Họ tên bệnh nhân *</label>
              <input
                required
                type="text"
                name="hoten"
                placeholder="Họ tên đầy đủ"
                value={formData.hoten}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Năm sinh</label>
              <input
                type="number"
                name="namsinh"
                placeholder="VD: 1990"
                value={formData.namsinh}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Giới tính</label>
              <select
                name="gioitinh"
                value={formData.gioitinh}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none appearance-none cursor-pointer"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Số căn cước công dân *</label>
              <input
                required
                type="text"
                name="socccd"
                inputMode="numeric"
                autoComplete="off"
                placeholder="12 số CCCD"
                value={formData.socccd}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Số điện thoại *</label>
              <input
                required
                type="tel"
                name="dienthoai"
                placeholder="09xxxxxxxx"
                value={formData.dienthoai}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Mã BHYT</label>
              <input
                type="text"
                name="mabhyt"
                placeholder="Tùy chọn"
                value={formData.mabhyt}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Quốc tịch</label>
              <input
                type="text"
                name="quoctich"
                value={formData.quoctich}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Dân tộc</label>
              <input
                type="text"
                name="dantoc"
                value={formData.dantoc}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-slate-700">Địa chỉ</label>
              <input
                type="text"
                name="diachi"
                placeholder="Địa chỉ liên hệ"
                value={formData.diachi}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Nghề nghiệp</label>
              <input
                type="text"
                name="nghenghiep"
                placeholder="Tùy chọn"
                value={formData.nghenghiep}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-slate-700">Email</label>
              <input
                type="email"
                name="email"
                placeholder="email@example.com (tùy chọn)"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 py-4 px-6 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded transition-all disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] py-4 px-6 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? 'Đang lưu...' : 'Thêm bệnh nhân'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPatientModal;
