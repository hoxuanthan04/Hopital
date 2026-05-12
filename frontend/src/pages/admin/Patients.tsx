import React, { useState, useEffect } from 'react';
import { 
  Search, Calendar, ChevronDown, Plus, X, Info
} from 'lucide-react';
import AddPatientModal, { NewBenhNhanPayload } from '../../components/admin/AddPatientModal';
import Pagination from '../../components/admin/Pagination'; // Import component mới

import { getBenhNhan, deleteBenhNhan, addBenhNhan } from "../../services/benhnhanApi";

type BenhNhanRow = {
  mabenhnhan: number;
  hoten: string;
  namsinh?: number | null;
  gioitinh?: string | null;
  dantoc?: string | null;
  dienthoai?: string | null;
  email?: string | null;
  socccd?: string | null;
  diachi?: string | null;
};

const Patients: React.FC = () => {

  // Data
  const [benhnhan, setBenhNhan] = useState<BenhNhanRow[]>([]);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await getBenhNhan();
      setBenhNhan(data);
    } catch (error) {
      console.error("Lỗi lấy bệnh nhân:", error);
    }
  };

  const handleAddPatient = async (payload: NewBenhNhanPayload) => {
    await addBenhNhan(payload);
    await fetchData();
    setCurrentPage(1);
  };


  const handleDelete = async (id: any) => {
    if (!window.confirm("Bạn có chắc muốn xóa?")) return;
    await deleteBenhNhan(id);
    fetchData();
  };

  const filteredPatients = benhnhan.filter((p) =>
    (p.hoten || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.socccd || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.dienthoai || '').toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentItems = filteredPatients.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  return (
    <div className="space-y-6">
      {/* Table Card */}
      <div className="bg-white rounded shadow-sm p-6 overflow-hidden flex flex-col">

        {/* Search & Actions */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Tìm kiếm bệnh nhân..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-transparent focus:border-blue-500 rounded outline-none transition-all"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="flex gap-4">
            <button className="flex items-center gap-3 px-6 py-3 border border-blue-500 text-blue-500 font-medium rounded hover:bg-blue-50 transition-colors">
              Filter by Date <Calendar size={18} />
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-all active:scale-95"
            >
              <Plus size={20} />
              Thêm bệnh nhân
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto -mx-6">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-50">
                <th className="py-4 px-6">Họ tên bệnh nhân <ChevronDown size={14} className="inline ml-1" /></th>
                <th className="py-4 px-4 text-center">Năm sinh</th>
                <th className="py-4 px-4 text-center">Giới tính</th>
                <th className="py-4 px-4 text-center">Dân tộc</th>
                <th className="py-4 px-6">Số điện thoại</th>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6">Số CCCD</th>
                <th className="py-4 px-6">Địa chỉ</th>
                <th className="py-4 px-6 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {currentItems.map((p) => (
                <tr key={p.mabenhnhan} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-2 px-6 text-sm text-slate-700 ">{p.hoten}</td>
                  <td className="py-2 px-6 text-sm text-slate-500 text-center">{p.namsinh}</td>
                  <td className="py-2 px-6 text-sm text-slate-500 text-center">{p.gioitinh}</td>
                  <td className="py-2 px-6 text-sm text-slate-500 text-center">{p.dantoc}</td>
                  <td className="py-2 px-6 text-sm text-slate-500">{p.dienthoai}</td>
                  <td className="py-2 px-6 text-sm text-slate-500">{p.email}</td>
                  <td className="py-2 px-6 text-sm text-slate-500">{p.socccd}</td>
                  <td className="py-2 px-6 text-sm text-slate-500">{p.diachi}</td>
                  <td className="py-2 px-6">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleDelete(p.mabenhnhan)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X size={18} />
                      </button>
                      <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                        <Info size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {currentItems.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-medium">
                    No patients found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Gọi component phân trang mới */}
        <Pagination
          totalItems={filteredPatients.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />

      </div>

      {/* Modal */}
      <AddPatientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddPatient}
      />
    </div>
  );
};

export default Patients;