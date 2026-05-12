import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

const CanLamSangModal = ({ isOpen, onClose, onSave, initialData, mode }) => {
  const [formData, setFormData] = useState({
    tendichvu: '',
    loaidichvu: '',
    gia: '',
    mota: '',
    trangthai: 'Đang hoạt động'
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ tendichvu: '', loaidichvu: '', gia: '', mota: '', trangthai: 'Đang hoạt động' });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const isView = mode === 'view';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-800">
            {mode === 'add' ? 'Thêm dịch vụ CLS' : mode === 'edit' ? 'Chỉnh sửa dịch vụ' : 'Chi tiết dịch vụ'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
          <div className="p-6 grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Tên dịch vụ</label>
              <input
                required disabled={isView}
                className="w-full px-4 py-2 bg-slate-0 border border-slate-200 rounded outline-none transition-all"
                value={formData.tendichvu}
                onChange={(e) => setFormData({...formData, tendichvu: e.target.value})}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Loại dịch vụ</label>
              <select 
                disabled={isView}
                className="w-full px-4 py-2 bg-slate-0 border border-slate-200 rounded outline-none"
                value={formData.loaidichvu}
                onChange={(e) => setFormData({...formData, loaidichvu: e.target.value})}
              >
                <option value="">Chọn loại...</option>
                <option value="Xét nghiệm">Xét nghiệm</option>
                <option value="Siêu âm">Siêu âm</option>
                <option value="X-Quang">X-Quang</option>
                <option value="Nội soi">Nội soi</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Giá dịch vụ (VNĐ)</label>
              <input
                type="number" required disabled={isView}
                className="w-full px-4 py-2 bg-slate-0 border border-slate-200 rounded outline-none"
                value={formData.gia}
                onChange={(e) => setFormData({...formData, gia: e.target.value})}
              />
            </div>

            <div className="col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Mô tả chi tiết</label>
              <textarea
                rows="3" disabled={isView}
                className="w-full px-4 py-2 bg-slate-0 border border-slate-200 rounded outline-none resize-none"
                value={formData.mota}
                onChange={(e) => setFormData({...formData, mota: e.target.value})}
              />
            </div>

            <div className="col-span-2 flex items-center gap-4 p-3 bg-slate-0 rounded">
              <label className="text-sm font-bold text-slate-700">Trạng thái:</label>
              <div className="flex gap-4">
                {['Đang hoạt động', 'Ngừng kinh doanh'].map((status) => (
                  <label key={status} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio" disabled={isView}
                      name="trangthai"
                      checked={formData.trangthai === status}
                      onChange={() => setFormData({...formData, trangthai: status})}
                    />
                    <span className="text-sm text-slate-600">{status}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-500">Hủy</button>
            {!isView && (
              <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white text-sm font-bold rounded shadow-lg">
                <Save size={18} /> Lưu dịch vụ
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CanLamSangModal;