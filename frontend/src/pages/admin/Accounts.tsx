import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, ShieldCheck, 
  Lock, Unlock, 
  Trash2, 
} from 'lucide-react';
import { Account } from '../../../types';
import TaiKhoanService from '../../services/taikhoan.service';
import AddAccountModal from '../../components/admin/AddAccountModal';
import Pagination from '../../components/admin/Pagination';

const Accounts: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [search, setSearch] = useState('');
  const [showPassword, setShowPassword] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; 

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const data = await TaiKhoanService.getAll();
      setAccounts(data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách tài khoản:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const getCurrentMataikhoan = (): number | null => {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return null;
      const u = JSON.parse(raw) as { mataikhoan?: number; id?: number };
      const v = u.mataikhoan ?? u.id;
      const n = Number(v);
      return Number.isFinite(n) && n > 0 ? n : null;
    } catch {
      return null;
    }
  };

  const handleToggleLock = async (acc: Account) => {
    const myId = getCurrentMataikhoan();
    if (myId != null && Number(acc.mataikhoan) === myId) {
      window.alert('Không thể khóa hoặc mở khóa tài khoản của chính bạn.');
      return;
    }
    const isActive = acc.trangthai === 'Hoạt động';
    const msg = isActive
      ? `Bạn có chắc muốn KHÓA tài khoản "${acc.tentaikhoan}"?`
      : `Bạn có chắc muốn MỞ KHÓA tài khoản "${acc.tentaikhoan}"?`;
    if (!window.confirm(msg)) return;
    try {
      await TaiKhoanService.toggleStatus(acc.mataikhoan, acc.trangthai);
      await fetchAccounts();
    } catch (error: unknown) {
      console.error('Lỗi:', error);
      let msgErr = 'Không thể cập nhật trạng thái tài khoản.';
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const d = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
        if (typeof d === 'string' && d) msgErr = d;
      }
      window.alert(msgErr);
    }
  };

  const handleSoftDelete = async (acc: Account) => {
    if (window.confirm(`Bạn có chắc chắn muốn XÓA tài khoản "${acc.tentaikhoan}"?`)) {
      try {
        await TaiKhoanService.softDelete(acc.mataikhoan);
        fetchAccounts();
      } catch (error) {
        alert("Xóa tài khoản thất bại!");
      }
    }
  };

  // Logic lọc
  const filteredAccounts = accounts.filter(acc => 
    !acc.isdelete && (
      acc.tentaikhoan.toLowerCase().includes(search.toLowerCase()) || 
      acc.loaitaikhoan.toLowerCase().includes(search.toLowerCase())
    )
  );

  // Tính toán dữ liệu hiển thị cho trang hiện tại
  const currentItems = filteredAccounts.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  useEffect(() => { setCurrentPage(1); }, [search]);

  // Thống kê
  const totalAcc = accounts.filter(a => !a.isdelete).length;
  const activeAcc = accounts.filter(a => !a.isdelete && a.trangthai === 'Hoạt động').length;
  const lockedAcc = accounts.filter(a => !a.isdelete && a.trangthai !== 'Hoạt động').length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white px-5 py-3 rounded border border-slate-100 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng tài khoản</p>
            <p className="text-xl font-black text-slate-800">{loading ? '...' : totalAcc}</p>
          </div>
          <div className="p-3 bg-slate-100 text-slate-600 rounded"><ShieldCheck size={28}/></div>
        </div>
        <div className="bg-white px-5 py-3 rounded border border-slate-100 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Đang hoạt động</p>
            <p className="text-xl font-black text-slate-800">{loading ? '...' : activeAcc}</p>
          </div>
          <div className="p-3 bg-slate-100 text-slate-600 rounded"><Unlock size={28}/></div>
        </div>
        <div className="bg-white px-5 py-3 rounded border border-slate-100 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bị tạm khóa</p>
            <p className="text-xl font-black text-slate-800">{loading ? '...' : lockedAcc}</p>
          </div>
          <div className="p-3 bg-slate-100 text-slate-600 rounded"><Lock size={28}/></div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm..." 
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded outline-none text-sm transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-all active:scale-95"
          >
            <Plus size={20} /> Cấp mới
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[11px] font-bold uppercase tracking-widest">
                <th className="py-4 px-6">Tên đăng nhập</th>
                <th className="py-4 px-4">Mật khẩu</th>
                <th className="py-4 px-4 text-center">Trạng thái</th>
                <th className="py-4 px-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {currentItems.map((acc) => (
                <tr key={acc.mataikhoan} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="py-2 px-6 text-sm text-slate-500">{acc.tentaikhoan}</td>
                  <td className="py-2 px-4 font-mono text-sm text-slate-400">
                    {showPassword === acc.mataikhoan ? acc.matkhau : '••••••••'}
                  </td>
                  <td className="py-2 px-4 text-center">
                    <span className={`px-2.5 py-1 rounded text-sm font-medium  ${
                      acc.trangthai === 'Hoạt động' ? 'text-slate-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {acc.trangthai}
                    </span>
                  </td>
                  <td className="py-2 px-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleToggleLock(acc)}
                        className={`p-2 rounded-lg ${acc.trangthai === 'Hoạt động' ? 'text-slate-400 hover:text-rose-600' : 'text-emerald-600 bg-emerald-50'}`}
                      >
                        {acc.trangthai === 'Hoạt động' ? <Unlock size={18} /> : <Lock size={18} />}
                      </button>
                      <button onClick={() => handleSoftDelete(acc)} className="p-2 text-slate-400 hover:text-rose-600"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Gọi component phân trang mới thay thế cho logic cũ */}
        {!loading && filteredAccounts.length > 0 && (
          <Pagination
            totalItems={filteredAccounts.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      <AddAccountModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchAccounts} />
    </div>
  );
};

export default Accounts;