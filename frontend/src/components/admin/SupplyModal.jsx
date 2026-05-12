import React, { useState, useEffect } from 'react';
import { X, Package, Factory, Microscope, BookOpen, Target, Globe, Layers, Activity } from 'lucide-react';

const SupplyModal = ({ isOpen, onClose, onSave, initialData = null, mode = 'add' }) => {
  const [formData, setFormData] = useState({
    tenvattu: '',
    loaivattu: 'Thuốc kháng sinh',
    nhasanxuat: '',
    hangsanxuat: '',
    thanhphan: '',
    huongdansudung: '',
    congdung: '',
    doituongsudung: '',
    chophepbanweb: false,
    giaban: 0
  });

  // Đổ dữ liệu vào form khi mở chế độ Edit hoặc View
  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData });
    } else {
      setFormData({
        tenvattu: '',
        loaivattu: 'Thuốc kháng sinh',
        nhasanxuat: '',
        hangsanxuat: '',
        thanhphan: '',
        huongdansudung: '',
        congdung: '',
        doituongsudung: '',
        giaban: 0,
        chophepbanweb: false
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const isViewMode = mode === 'view';

  const handleChange = (e) => {
    if (isViewMode) return;
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isViewMode) return;
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-7xl rounded-lg shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-300">
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-bold text-slate-800">
              {isViewMode ? 'Chi tiết vật tư' : mode === 'edit' ? 'Cập nhật vật tư' : 'Thêm vật tư mới'}
            </h3>
            <p className="text-xs text-slate-500">Mã vật tư: {formData.mavattu || 'Tự động tạo'}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-white rounded-full transition-all">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tên vật tư */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2"> Tên vật tư</label>
              <input disabled={isViewMode} required name="tenvattu" value={formData.tenvattu} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-0 border border-slate-200 rounded outline-none disabled:opacity-70" />
            </div>

            {/* Loại */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2"> Loại vật tư</label>
              <select disabled={isViewMode} name="loaivattu" value={formData.loaivattu} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-0 border border-slate-200 rounded outline-none disabled:opacity-70">
                <option value="Thuốc kháng sinh">Thuốc kháng sinh</option>
                <option value="Vật tư tiêu hao">Vật tư tiêu hao</option>
                <option value="Dụng cụ phẫu thuật">Dụng cụ phẫu thuật</option>
              </select>
            </div>

            {/* Hãng sản xuất */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2"> Hãng sản xuất</label>
              <input disabled={isViewMode} required name="hangsanxuat" value={formData.hangsanxuat} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-0 border border-slate-200 rounded outline-none disabled:opacity-70" />
            </div>

            {/* Nhà sản xuất */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2"> Xuất xứ / Nhà SX</label>
              <input disabled={isViewMode} name="nhasanxuat" value={formData.nhasanxuat} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-0 border border-slate-200 rounded outline-none disabled:opacity-70" />
            </div>

            {/* Đối tượng */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2"> Đối tượng</label>
              <input disabled={isViewMode} name="doituongsudung" value={formData.doituongsudung} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-0 border border-slate-200 rounded outline-none disabled:opacity-70" />
            </div>

            {/* Giá cả */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2"> Giá cả</label>
              <input type="number" disabled={isViewMode} name="giaban" value={formData.giaban} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-0 border border-slate-200 rounded outline-none disabled:opacity-70" />
            </div>


            {/* Textareas */}
            <div className="md:col-span-1 space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2"> Thành phần</label>
              <textarea disabled={isViewMode} name="thanhphan" value={formData.thanhphan} onChange={handleChange} rows="3" className="w-full px-4 py-2 bg-slate-0 border border-slate-200 rounded outline-none resize-none disabled:opacity-70" />
            </div>
            <div className="md:col-span-1 space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2"> Công dụng</label>
              <textarea disabled={isViewMode} name="congdung" value={formData.congdung} onChange={handleChange} rows="3" className="w-full px-4 py-2 bg-slate-0 border border-slate-200 rounded outline-none resize-none disabled:opacity-70" />
            </div>
            <div className="md:col-span-1 space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2"> Cách dùng</label>
              <textarea disabled={isViewMode} name="huongdansudung" value={formData.huongdansudung} onChange={handleChange} rows="3" className="w-full px-4 py-2 bg-slate-0 border border-slate-200 rounded outline-none resize-none disabled:opacity-70" />
            </div>
          </div>
          {/* Web Checkbox */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2"> Kinh doanh Web</label>
              <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded h-[46px]">
                <input disabled={isViewMode} type="checkbox" name="chophepbanweb" checked={formData.chophepbanweb} onChange={handleChange} className="w-4 h-4 accent-blue-500" />
                <span className="text-sm text-slate-600">Bán trực tuyến</span>
              </div>
            </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
            <button type="button" onClick={onClose} className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded transition-all">
              Đóng
            </button>
            {!isViewMode && (
              <button type="submit" className="px-8 py-2.5 bg-blue-500 text-white font-bold rounded shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-all">
                {mode === 'edit' ? 'Lưu thay đổi' : 'Thêm vào kho'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplyModal;