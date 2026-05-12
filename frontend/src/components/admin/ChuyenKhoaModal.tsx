import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';

const ChuyenKhoaModal = ({ isOpen, onClose, onSave, initialData, mode }) => {
  const [formData, setFormData] = useState({
    tenchuyenkhoa: '',
    mota: '',
    trangthai: true
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ tenchuyenkhoa: '', mota: '', trangthai: true });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const isView = mode === 'view';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-800">
            {mode === 'add' ? 'Thêm Chuyên khoa mới' : mode === 'edit' ? 'Chỉnh sửa Chuyên khoa' : 'Chi tiết Chuyên khoa'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {/* Tên chuyên khoa */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tên chuyên khoa</label>
              <input
                required
                disabled={isView}
                type="text"
                className="w-full px-4 py-2.5 bg-slate-0 border border-slate-200 rounded outline-none transition-all disabled:opacity-70"
                value={formData.tenchuyenkhoa}
                onChange={(e) => setFormData({...formData, tenchuyenkhoa: e.target.value})}
              />
            </div>

            {/* Mô tả */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mô tả</label>
              <textarea
                disabled={isView}
                rows="4"
                className="w-full px-4 py-2.5 bg-slate-0 border border-slate-200 rounded outline-none transition-all disabled:opacity-70 resize-none"
                value={formData.mota}
                onChange={(e) => setFormData({...formData, mota: e.target.value})}
              />
            </div>

            {/* Trạng thái */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded">
              <input
                disabled={isView}
                type="checkbox"
                id="trangthai"
                className="w-4 h-4 text-slate-600 border-slate-300 rounded focus:ring-slate-500 cursor-pointer"
                checked={formData.trangthai}
                onChange={(e) => setFormData({...formData, trangthai: e.target.checked})}
              />
              <label htmlFor="trangthai" className="text-sm font-medium text-slate-700 cursor-pointer">
                Đang hoạt động (Cho phép đặt lịch)
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-white rounded transition-colors"
            >
              Đóng
            </button>
            {!isView && (
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white text-sm font-bold rounded shadow-lg shadow-slate-500/20 hover:bg-blue-600 active:scale-95 transition-all"
              >
                <Save size={18} /> Lưu dữ liệu
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChuyenKhoaModal;