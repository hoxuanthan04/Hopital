import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, Stethoscope, ArrowRight, Activity, Search, Filter } from 'lucide-react';
import HoSoKhamBenhService from '../../services/hosokhambenh.service';

function formatDateVN(isoOrDate: string | null | undefined) {
  if (!isoOrDate) return '—';
  const s = String(isoOrDate).trim();
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  return s;
}

type HoSoRow = {
  mahosokham: number;
  ngaykham_luot?: string | null;
  bacsiphutrach_ten?: string | null;
  khoakham?: string | null;
  ketluan?: string | null;
  chandoansobo?: string | null;
  lydokham?: string | null;
  trangthai?: string | null;
};

export default function MedicalRecords() {
  const [rows, setRows] = useState<HoSoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await HoSoKhamBenhService.getBenhNhanHoSoHoanTat();
        if (!cancelled) setRows(Array.isArray(data) ? data : []);
      } catch (e: unknown) {
        const msg =
          (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Không tải được danh sách hồ sơ.';
        if (!cancelled) setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const id = String(r.mahosokham);
      const dx = (r.ketluan || r.chandoansobo || r.lydokham || '').toLowerCase();
      const dept = (r.khoakham || '').toLowerCase();
      return id.includes(q) || dx.includes(q) || dept.includes(q);
    });
  }, [rows, search]);

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Hero Section */}
      <div className="bg-[#0B2046] text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Lịch sử khám bệnh</h1>
          <p className="text-blue-200 text-lg">Quản lý và theo dõi hồ sơ y tế, kết quả khám bệnh của bạn.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-white rounded shadow-sm border border-slate-100 p-6 sm:p-8">
          
          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
            <div className="relative w-full sm:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input 
                type="text" 
                placeholder="Tìm kiếm theo mã hồ sơ, chẩn đoán..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-full py-2.5 border border-slate-200 rounded focus:ring-2 focus:ring-[#0084FF] focus:border-transparent outline-none transition-all"
              />
            </div>
            <button type="button" className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50 transition-colors w-full sm:w-auto justify-center">
              <Filter className="h-5 w-5" /> Lọc kết quả
            </button>
          </div>

          {error && (
            <p className="text-sm text-red-600 mb-4">{error}</p>
          )}

          {/* Records List */}
          <div className="space-y-4">
            {loading ? (
              <p className="text-slate-600 text-center py-8">Đang tải hồ sơ...</p>
            ) : filtered.length === 0 ? (
              <p className="text-slate-600 text-center py-8">
                {rows.length === 0 ? 'Danh sách trống' : 'Không có hồ sơ khớp bộ lọc tìm kiếm.'}
              </p>
            ) : (
              filtered.map((record) => {
                const diagnosis =
                  record.ketluan || record.chandoansobo || record.lydokham || '—';
                const date = formatDateVN(record.ngaykham_luot);
                const doctor = record.bacsiphutrach_ten || '—';
                const department = record.khoakham || '—';
                const status = record.trangthai || 'Đã hoàn tất';
                const idStr = String(record.mahosokham);

                return (
                  <div key={idStr} className="border border-slate-100 rounded p-5 hover:shadow transition-all hover:border-blue-100 group bg-white">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-grow">
                        <div className="flex items-center gap-3">
                          <span className="text-[#0084FF] py-1 text-sm font-medium flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" /> {date}
                          </span>
                          <span className="text-slate-500 text-sm">Mã HS: {idStr}</span>
                        </div>
                        <h3 className="text-lg font-bold text-[#0B2046] mb-2">{diagnosis}</h3>
                        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <User className="h-4 w-4 text-slate-400" /> {doctor}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Stethoscope className="h-4 w-4 text-slate-400" /> {department}
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0 pt-4 md:pt-0 md:border-l md:border-slate-100 md:pl-6 flex flex-col items-start md:items-end gap-3">
                        <span className="inline-flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-medium">
                          <Activity className="h-4 w-4" /> {status}
                        </span>
                        <Link 
                          to={`/medicalresults/${idStr}`}
                          className="inline-flex items-center gap-2 text-[#0084FF] font-medium hover:text-blue-700 transition-colors group-hover:gap- px-4 py-2 rounded-lg"
                        >
                          Xem chi tiết <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
