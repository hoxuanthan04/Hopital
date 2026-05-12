import React, { useState, useEffect } from 'react';
import {
  Search,
  ChevronDown,
  Plus,
  Info,
  MoreHorizontal,
  Trash2,
  Mail,
  Phone,
} from 'lucide-react';
import Pagination from '../../components/admin/Pagination';
import AddDoctorModal from '../../components/admin/DoctorModal'; 
import NhanVienService from '../../services/nhanvien.service';

interface AdminDoctor {
  id: number;
  hoten: string;
  chuyenkhoa: string;
  gioitinh: string;
  hocham: string;
  ngaysinh: string;
  sodienthoai: string;
  email: string;
  socccd: string;
  trangthai: string;
  chucvu: string;
  anh: string;
}

interface NhanVienApiRow {
  manhanvien: number;
  hoten: string;
  chuyenkhoa?: string | null;
  gioitinh: string;
  hocham?: string | null;
  ngaysinh?: string | null;
  sdt?: string | null;
  email: string;
  socccd?: string | null;
  trangthai?: string | null;
  chucvu?: string | null;
  anh?: string | null;
}

const Doctors: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [doctors, setDoctors] = useState<AdminDoctor[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedDoctor, setSelectedDoctor] = useState<AdminDoctor | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const data: NhanVienApiRow[] = await NhanVienService.getAll();
      const mappedData: AdminDoctor[] = data.map((item) => ({
        id: item.manhanvien,
        hoten: item.hoten,
        chuyenkhoa: item.chuyenkhoa || 'Chưa xác định',
        gioitinh: item.gioitinh,
        hocham: item.hocham || '',
        ngaysinh: item.ngaysinh ? new Date(item.ngaysinh).toLocaleDateString('vi-VN') : 'N/A', // Đổ ngày sinh vào cột experience cũ
        sodienthoai: item.sdt ?? '',
        email: item.email,
        socccd: item.socccd ?? '',
        trangthai: item.trangthai || 'Available',
        chucvu: item.chucvu || 'Nhân viên',
        anh: item.anh || `https://picsum.photos/seed/${item.manhanvien}/150/150`,
      }));
      setDoctors(mappedData);
    } catch (error) {
      console.error("Lỗi khi tải danh sách:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleOpenAdd = () => {
    setModalMode('add');
    setSelectedDoctor(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (doc: AdminDoctor) => {
    setModalMode('edit');
    setSelectedDoctor(doc);
    setModalOpen(true);
  };

  const handleOpenView = (doc: AdminDoctor) => {
    setModalMode('view');
    setSelectedDoctor(doc);
    setModalOpen(true);
  };

  const handleSaveDoctor = async (formData: any) => {
    try {
      if (modalMode === 'add') {
        await NhanVienService.create(formData);
        alert("Thêm nhân viên thành công!");
      } else {
        await NhanVienService.update(formData.manhanvien, formData);
        alert("Cập nhật thành công!");
      }
      setModalOpen(false);
      fetchDoctors();
    } catch (error: any) {
      alert(error.response?.data?.message || "Lỗi thao tác");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa nhân viên này?")) {
      try {
        await NhanVienService.delete(id);
        alert("Đã xóa thành công!");
        fetchDoctors();
      } catch (error: any) {
        alert(error.response?.data?.message || "Lỗi khi xóa");
      }
    }
  };

  const specialties = ['All', ...new Set(doctors.map((d) => d.chuyenkhoa))];

  const filteredDoctors = doctors.filter((d) => {
    const matchesSearch = d.hoten.toLowerCase().includes(search.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'All' || d.chuyenkhoa === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDoctors.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded shadow-sm p-6 overflow-hidden flex flex-col">
        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Tìm kiếm nhân viên..." 
              className="w-full pl-12 pr-4 py-2 bg-slate-50 border border-slate-200 rounded outline-none"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>

          <div className="flex gap-4">
            <div className="relative group">
              <select 
                className="appearance-none flex items-center gap-3 pl-6 pr-10 py-2 border border-slate-100 text-slate-600 font-medium rounded hover:bg-slate-50 transition-colors outline-none cursor-pointer bg-white"
                value={selectedSpecialty}
                onChange={(e) => { setSelectedSpecialty(e.target.value); setCurrentPage(1); }}
              >
                {specialties.map((spec, specIdx) => (
                  <option key={`spec-${specIdx}-${spec}`} value={spec}>
                    {spec === 'All' ? 'Tất cả chuyên khoa' : spec}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            <button 
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-all active:scale-95"
            >
              <Plus size={20} /> Thêm nhân viên
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto -mx-6">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-50">
                <th className="py-4 px-6">Tên nhân viên <ChevronDown size={14} className="inline ml-1" /></th>
                <th className="py-4 px-4 text-center">Chuyên ngành</th>
                <th className="py-4 px-4 text-center">Giới tính</th>
                <th className="py-4 px-4 text-center">Chức vụ</th>
                <th className="py-4 px-4 text-center">Ngày sinh</th>
                <th className="py-4 px-4 text-center">Số CCCD</th>
                <th className="py-4 px-4 text-center">Trạng thái</th>
                <th className="py-4 px-6">Thông tin liên hệ</th>
                <th className="py-4 px-6 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={9} className="py-8 text-center text-slate-400">Đang tải dữ liệu...</td></tr>
              ) : currentItems.map((doctor, rowIdx) => (
                <tr
                  key={`nv-${doctor.id}-${indexOfFirstItem + rowIdx}-${doctor.email || ''}`}
                  className="group hover:bg-slate-50/50 transition-colors"
                >
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-4">
                      <img src={doctor.anh} alt="" className="w-10 h-10 rounded shadow-sm object-cover" />
                      <div>
                        <span className="font-medium text-slate-600 block leading-tight">{doctor.hoten}</span>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">{doctor.hocham}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-sm text-slate-500">
                      {doctor.chuyenkhoa}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-sm text-slate-500">
                      {doctor.gioitinh}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-sm text-slate-500">
                      {doctor.chucvu}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center text-slate-600 text-sm text-slate-500">
                    <div className="flex items-center justify-center gap-1">
                       {doctor.ngaysinh}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center text-sm text-slate-500">
                    <div className="flex items-center justify-center gap-1">
                        {doctor.socccd}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`px-3 py-1 rounded text-sm tracking-wider ${
                      doctor.trangthai === 'Available' ? 'text-slate-600' : 'text-slate-400'
                    }`}>
                      {doctor.trangthai}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2 text-sm text-slate-500"><Phone size={10} /> {doctor.sodienthoai}</div>
                      <div className="flex items-center gap-2 text-sm text-slate-500"><Mail size={10} /> {doctor.email}</div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleOpenView(doctor)} className="p-2 text-slate-500 hover:bg-blue-50 rounded transition-all bg-white "><Info size={18} /></button>
                      <button onClick={() => handleOpenEdit(doctor)} className="p-2 text-slate-500 hover:bg-amber-50 rounded transition-all bg-white "><MoreHorizontal size={18} /></button>
                      <button onClick={() => handleDelete(doctor.id)} className="p-2 text-slate-400 hover:bg-red-50 rounded transition-all"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination 
          totalItems={filteredDoctors.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Modal đa năng sử dụng chung logic */}
      <AddDoctorModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSave={handleSaveDoctor} 
        initialData={selectedDoctor}
        mode={modalMode}
      />
    </div>
  );
};

export default Doctors;