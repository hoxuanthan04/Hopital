import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Info, Trash2, 
  MoreHorizontal, CheckCircle2, XCircle
} from 'lucide-react';
import ChuyenKhoaService from '../../services/chuyenkhoa.service';
import ChuyenKhoaModal from '../../components/admin/ChuyenKhoaModal';
import Pagination from '../../components/admin/Pagination'; 

const ChuyenKhoa = () => {
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); 
  const [selectedDept, setSelectedDept] = useState(null);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const data = await ChuyenKhoaService.getAll();
      setDepartments(data);
    } catch (error) {
      console.error("Lỗi khi tải chuyên khoa:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // Logic lọc dữ liệu theo tên chuyên khoa
  const filteredDepartments = departments.filter(item => 
    item.tenchuyenkhoa.toLowerCase().includes(search.toLowerCase())
  );

  // Tính toán dữ liệu hiển thị cho trang hiện tại
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDepartments.slice(indexOfFirstItem, indexOfLastItem);

  // Điều khiển Modal
  const handleOpenAdd = () => {
    setModalMode('add');
    setSelectedDept(null);
    setModalOpen(true);
  };

  const handleOpenView = (item) => {
    setModalMode('view');
    setSelectedDept(item);
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setModalMode('edit');
    setSelectedDept(item);
    setModalOpen(true);
  };

  const handleSave = async (data) => {
    try {
      if (modalMode === 'add') {
        await ChuyenKhoaService.create(data);
        alert("Thêm chuyên khoa thành công!");
      } else {
        await ChuyenKhoaService.update(data.machuyenkhoa, data);
        alert("Cập nhật thành công!");
      }
      setModalOpen(false);
      fetchDepartments();
    } catch (error) {
      alert("Có lỗi xảy ra: " + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa chuyên khoa này?")) {
      try {
        await ChuyenKhoaService.delete(id);
        fetchDepartments();
      } catch (error) {
        alert("Lỗi khi xóa dữ liệu");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        {/* Thanh tìm kiếm */}
        <div className="p-6 border-b border-slate-50 flex flex-row justify-between">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm tên chuyên khoa..." 
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-transparent focus:border-slate-500 rounded outline-none text-sm transition-all"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <button   
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded font-bold shadow-lg hover:bg-blue-600 transition-all active:scale-95">
            <Plus size={20} /> Thêm chuyên khoa
          </button>
        </div>

        {/* Bảng dữ liệu */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[11px] font-bold uppercase tracking-widest border-b border-slate-50">
                <th className="py-4 px-6">Tên chuyên khoa</th>
                <th className="py-4 px-4">Mô tả</th>
                <th className="py-4 px-4 text-center">Trạng thái</th>
                <th className="py-4 px-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="4" className="py-12 text-center text-slate-400 text-sm">Đang tải dữ liệu...</td></tr>
              ) : currentItems.length === 0 ? (
                <tr><td colSpan="4" className="py-12 text-center text-slate-400 text-sm">Không tìm thấy dữ liệu</td></tr>
              ) : (
                currentItems.map((item) => (
                  <tr key={item.machuyenkhoa} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <p className="text-sm text-slate-500 leading-none">{item.tenchuyenkhoa}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-slate-500 line-clamp-1 max-w-[300px]">{item.mota || 'Chưa có mô tả'}</p>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.trangthai ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-600 rounded text-sm font-medium ">
                          <CheckCircle2 size={12} /> Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-400 rounded text-sm font-medium ">
                          <XCircle size={12} /> Ngừng nhận
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenView(item)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                          <Info size={18} />
                        </button>
                        <button onClick={() => handleOpenEdit(item)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all">
                          <MoreHorizontal size={18} /> 
                        </button>
                        <button onClick={() => handleDelete(item.machuyenkhoa)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
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

        {/* Gọi component phân trang mới thay thế cho logic cũ */}
        {!loading && filteredDepartments.length > 0 && (
          <Pagination
            totalItems={filteredDepartments.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      <ChuyenKhoaModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSave={handleSave}
        initialData={selectedDept}
        mode={modalMode}
      />
    </div>
  );
};

export default ChuyenKhoa;