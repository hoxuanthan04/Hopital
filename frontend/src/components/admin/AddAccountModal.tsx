import React, { useState, useEffect } from 'react';
import { X, UserPlus, ShieldCheck, Lock, User, Key } from 'lucide-react';
import TaiKhoanService from '../../services/taikhoan.service';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddAccountModal: React.FC<AddAccountModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<any>(null);
  const [formData, setFormData] = useState({
    tentaikhoan: '',
    matkhau: '',
    loaitaikhoan: 'Staff'
  });

  useEffect(() => {
    if (isOpen) {
      loadEmployees();
      setFormData({ tentaikhoan: '', matkhau: '', loaitaikhoan: 'Staff' });
      setSelectedEmp(null);
    }
  }, [isOpen]);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const data = await TaiKhoanService.getAvailableEmployees();
      setEmployees(data);
    } catch (error) {
      console.error("Lỗi tải nhân viên");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return alert("Vui lòng chọn nhân viên");

    try {
      await TaiKhoanService.create({
        ...formData,
        manguoidung: selectedEmp.manhanvien,
        trangthai: 'Hoạt động',
        isdelete: false
      });
      onSuccess();
      onClose();
    } catch (error) {
      alert("Lỗi khi cấp tài khoản");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-300">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 text-white rounded-lg"><UserPlus size={20}/></div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Cấp tài khoản mới</h3>
              <p className="text-xs text-slate-500">Chọn nhân viên và thiết lập quyền truy cập</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-all">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Bước 1: Chọn nhân viên */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Chọn nhân viên chưa có tài khoản</label>
            <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto p-1 border rounded-lg border-slate-100 bg-slate-50/30">
              {loading ? (
                <p className="text-center py-4 text-sm text-slate-400">Đang tải...</p>
              ) : employees.length === 0 ? (
                <p className="text-center py-4 text-sm text-slate-400">Không có nhân viên nào chờ cấp</p>
              ) : (
                employees.map((emp: any) => (
                  <div 
                    key={emp.manhanvien}
                    onClick={() => setSelectedEmp(emp)}
                    className={`flex items-center justify-between p-3 rounded cursor-pointer border transition-all ${
                      selectedEmp?.manhanvien === emp.manhanvien 
                      ? 'border-blue-500 bg-blue-50 shadow-sm' 
                      : 'border-transparent bg-white hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                        {emp.hoten.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[16px] font-bold text-slate-700">{emp.hoten}</p>
                        <p className="text-[12px] text-slate-500">{emp.chucvu} - {emp.chuyenkhoa}</p>
                      </div>
                    </div>
                    {selectedEmp?.manhanvien === emp.manhanvien && <ShieldCheck size={18} className="text-blue-500"/>}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Bước 2: Nhập thông tin tài khoản */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <User size={14} className="text-blue-500"/> Tên đăng nhập
              </label>
              <input 
                required
                className="w-full px-4 py-2.5 border border-slate-200 rounded outline-none text-sm"
                placeholder="Ví dụ: nhanvien01"
                value={formData.tentaikhoan}
                onChange={e => setFormData({...formData, tentaikhoan: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Key size={14} className="text-blue-500"/> Mật khẩu
              </label>
              <input 
                required type="password"
                className="w-full px-4 py-2.5 border border-slate-200 rounded outline-none text-sm"
                placeholder="********"
                value={formData.matkhau}
                onChange={e => setFormData({...formData, matkhau: e.target.value})}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Lock size={14} className="text-blue-500"/> Loại tài khoản
              </label>
              <select 
                className="w-full px-4 py-2.5 border border-slate-200 rounded outline-none text-sm"
                value={formData.loaitaikhoan}
                onChange={e => setFormData({...formData, loaitaikhoan: e.target.value})}
              >
                <option value="Staff">Nhân viên (Staff)</option>
                <option value="Doctor">Bác sĩ (Doctor)</option>
                <option value="Admin">Quản trị viên (Admin)</option>
              </select>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex gap-3 pt-2">
            <button 
              type="button" onClick={onClose}
              className="flex-1 py-3 text-sm font-bold text-slate-500 bg-slate-100 rounded hover:bg-slate-200 transition-all"
            >
              Hủy bỏ
            </button>
            <button 
              type="submit"
              className="flex-[2] py-3 text-sm font-bold text-white bg-blue-500 rounded shadow-lg shadow-blue-500/20 hover:bg-blue-600 active:scale-[0.98] transition-all"
            >
              Xác nhận cấp tài khoản
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAccountModal;