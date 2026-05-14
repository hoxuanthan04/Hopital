import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { uploadImageSingle } from '../../services/upload.service';

interface AddDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (doctorData: any) => void; // Đổi từ onAdd thành onSave để dùng chung
  initialData?: any; 
  mode?: 'add' | 'edit' | 'view';
}

const AddDoctorModal: React.FC<AddDoctorModalProps> = ({ isOpen, onClose, onSave, initialData, mode = 'add' }) => {
  const initialState = {
    hoten: '',
    chuyenkhoa: 'Khoa Nội',
    gioitinh: 'Nam',
    ngaysinh: '',
    hocham: '',
    socccd: '',
    chucvu: '',
    sdt: '',
    email: '',
    anh: ''
  }; 

  

  const [formData, setFormData] = useState(initialState);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Logic đổ dữ liệu khi Sửa hoặc Xem
  useEffect(() => {
    if (initialData && (mode === 'edit' || mode === 'view')) {

      
      setFormData({
        ...initialData,
        hoten: initialData.hoten || initialData.hoten,
        manhanvien: initialData.id || initialData.manhanvien,
        ngaysinh: initialData.ngaysinh,
        gioitinh: initialData.gioitinh,
        email: initialData.email,
        socccd: initialData.socccd,
        chuyenkhoa: initialData.chuyenkhoa || initialData.chuyenkhoa,
        hocham: initialData.hocham || initialData.hocham,
        sdt: initialData.sodienthoai || initialData.sdt,
        anh: initialData.anh || initialData.anh 
      });
    } else {
      setFormData(initialState);
    }
  }, [initialData, mode, isOpen]);

  if (!isOpen) return null;

  const isReadOnly = mode === 'view';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    onSave(formData);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || isReadOnly) return;
    setUploadErr(null);
    setUploadBusy(true);
    try {
      const { url } = await uploadImageSingle(file, 'bacsi');
      if (url) setFormData((prev) => ({ ...prev, anh: String(url) }));
    } catch (err: unknown) {
      const msg =
        typeof err === 'object' && err !== null && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setUploadErr(msg || 'Không tải được ảnh lên Cloudinary.');
    } finally {
      setUploadBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-7xl rounded-[8px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in slide-in-from-bottom-4 duration-300">
        
        {/* Header - Giữ nguyên Design */}
        <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-2xl font-bold text-slate-800">
              {mode === 'add' ? 'Thêm mới nhân viên' : mode === 'edit' ? 'Chỉnh sửa nhân viên' : 'Chi tiết nhân viên'}
            </h3>
            <p className="text-sm text-slate-500">
              {isReadOnly ? 'Thông tin hồ sơ nhân viên trong hệ thống' : 'Nhập đầy đủ thông tin bên dưới để lưu hồ sơ nhân viên'}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded transition-all shadow-sm"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form Body - Giữ nguyên Grid 3 cột */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Họ và tên */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2"> Họ và tên
              </label>
              <input 
                required name="hoten" disabled={isReadOnly}
                value={formData.hoten} onChange={handleChange} 
                placeholder="Nguyễn Văn A" 
                className="w-full px-4 py-3  border border-slate-100 rounded focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-70" 
              />
            </div>

            {/* Chuyên Khoa */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2"> Chuyên Khoa
              </label>
              <select 
                name="chuyenkhoa" disabled={isReadOnly}
                value={formData.chuyenkhoa} onChange={handleChange} 
                className="w-full px-4 py-3  border border-slate-100 rounded focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer disabled:opacity-70"
              >
                <option value="Khoa Nội">Khoa Nội</option>
                <option value="Khoa Ngoại">Khoa Ngoại</option>
                <option value="Khoa Tim Mạch">Khoa Tim Mạch</option>
                <option value="Khoa Sản">Khoa Sản</option>
                <option value="Khoa Nhi">Khoa Nhi</option>
              </select>
            </div>

            {/* Giới tính */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2"> Giới tính
              </label>
              <select 
                name="gioitinh" disabled={isReadOnly}
                value={formData.gioitinh} onChange={handleChange} 
                className="w-full px-4 py-3  border border-slate-100 rounded focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer disabled:opacity-70"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            {/* Ngày sinh */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">Ngày sinh
              </label>
              <input 
                type="date" required name="ngaysinh" disabled={isReadOnly}
                value={formData.ngaysinh} onChange={handleChange} 
                className="w-full px-4 py-3  border border-slate-100 rounded  outline-none disabled:opacity-70" 
              />
            </div>

            {/* Học hàm */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2"> Học hàm
              </label>
              <input 
                required name="hocham" disabled={isReadOnly}
                value={formData.hocham} onChange={handleChange} 
                placeholder="Thạc sĩ / Bác sĩ CK1" 
                className="w-full px-4 py-3  border border-slate-100 rounded  outline-none disabled:opacity-70" 
              />
            </div>

            {/* Số CCCD */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">Số CCCD
              </label>
              <input 
                type="text" required name="socccd" disabled={isReadOnly}
                value={formData.socccd} onChange={handleChange} 
                placeholder="034XXXXXXXXX" 
                className="w-full px-4 py-3  border border-slate-100 rounded  outline-none disabled:opacity-70" 
              />
            </div>

            {/* Chức vụ */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2"> Chức vụ
              </label>
              <input 
                required name="chucvu" disabled={isReadOnly}
                value={formData.chucvu} onChange={handleChange} 
                placeholder="Bác sĩ điều trị" 
                className="w-full px-4 py-3  border border-slate-100 rounded  outline-none disabled:opacity-70" 
              />
            </div>

            {/* Số điện thoại */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2"> Số điện thoại
              </label>
              <input 
                required name="sdt" disabled={isReadOnly}
                value={formData.sdt} onChange={handleChange} 
                placeholder="09XXXXXXXX" 
                className="w-full px-4 py-3  border border-slate-100 rounded  outline-none disabled:opacity-70" 
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2"> Địa chỉ Email
              </label>
              <input 
                required type="email" name="email" disabled={isReadOnly}
                value={formData.email} onChange={handleChange} 
                placeholder="nguyenvana@clinic.com" 
                className="w-full px-4 py-3  border border-slate-100 rounded  outline-none disabled:opacity-70" 
              />
            </div>

            {/* Ảnh — upload Cloudinary, URL lưu vào cột anh */}
            <div className="space-y-2 md:col-span-3">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <ImageIcon size={16} /> Ảnh đại diện (Cloudinary)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                disabled={isReadOnly || uploadBusy}
                onChange={handlePickImage}
              />
              <div className="flex flex-col sm:flex-row gap-4 sm:items-start">
                {!isReadOnly && (
                  <button
                    type="button"
                    disabled={uploadBusy}
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded border border-slate-200 bg-slate-50 text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-60 shrink-0"
                  >
                    {uploadBusy ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                    {uploadBusy ? 'Đang tải lên…' : 'Chọn ảnh & tải lên'}
                  </button>
                )}
                {formData.anh && (
                  <img
                    src={formData.anh}
                    alt=""
                    className="w-44 h-44 sm:w-52 sm:h-52 rounded-xl border-2 border-slate-200 object-cover bg-slate-50 shrink-0 shadow-sm"
                  />
                )}
              </div>
              {uploadErr && <p className="text-xs text-rose-600 font-medium">{uploadErr}</p>}
            </div>
          </div>

          {/* Action Buttons - Giữ nguyên Design */}
          <div className="pt-4 flex gap-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 py-4 px-6 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded transition-all active:scale-95"
            >
              {isReadOnly ? 'Đóng cửa sổ' : 'Hủy bỏ'}
            </button>
            {!isReadOnly && (
              <button 
                type="submit" 
                className="flex-[2] py-4 px-6 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded shadow-lg shadow-blue-500/25 transition-all active:scale-95"
              >
                {mode === 'add' ? 'Xác nhận thêm nhân viên' : 'Lưu thay đổi hồ sơ'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDoctorModal;