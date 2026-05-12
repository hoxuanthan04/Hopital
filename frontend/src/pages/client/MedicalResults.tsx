import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, Calendar, Stethoscope, Activity, HeartPulse, Thermometer, Weight, Pill, FileBarChart, Download, Printer, AlertCircle, ArrowLeft } from 'lucide-react';
import HoSoKhamBenhService from '../../services/hosokhambenh.service';

function formatDateVN(isoOrDate: string | null | undefined) {
  if (!isoOrDate) return '—';
  const s = String(isoOrDate).trim();
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  return s;
}

type ApiDetail = {
  mahosokham: number;
  ngaykham_luot?: string | null;
  benhnhan_hoten?: string | null;
  benhnhan_gioitinh?: string | null;
  benhnhan_namsinh?: number | null;
  mabenhnhan?: number | null;
  bacsiphutrach_ten?: string | null;
  khoakham?: string | null;
  trieuchungbandau?: string | null;
  lydokham?: string | null;
  ketluan?: string | null;
  chandoansobo?: string | null;
  ketquacanlamsang?: string | null;
  ngayhentaikham?: string | null;
  trangthai?: string | null;
  chidinh?: Array<{ tendichvu?: string; trangthai?: string; loaidichvu?: string }>;
  donthuocChiTiet?: Array<{
    tenthuoc?: string;
    lieudung?: string | null;
    cachdung?: string | null;
    soluong?: number | null;
  }>;
};

const dash = '—';

export default function MedicalResults() {
  const { id } = useParams();
  const [api, setApi] = useState<ApiDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError('Thiếu mã hồ sơ.');
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await HoSoKhamBenhService.getBenhNhanHoSoChiTiet(id);
        if (!cancelled) setApi(data);
      } catch (e: unknown) {
        const msg =
          (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Không tải được hồ sơ.';
        if (!cancelled) {
          setApi(null);
          setError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const record = useMemo(() => {
    if (!api) {
      return {
        id: id || dash,
        date: dash,
        patient: { name: dash, age: dash, gender: dash, id: dash },
        doctor: { name: dash, department: dash },
        vitals: {
          bloodPressure: dash,
          heartRate: dash,
          temperature: dash,
          weight: dash
        },
        diagnosis: dash,
        symptoms: dash,
        labResults: [] as Array<{
          name: string;
          status: string;
          date: string;
          isNormal: boolean;
          note?: string;
        }>,
        prescriptions: [] as Array<{
          name: string;
          dosage: string;
          frequency: string;
          duration: string;
        }>,
        advice: dash,
        followUpDate: dash
      };
    }

    const visitDate = formatDateVN(api.ngaykham_luot);
    const y = api.benhnhan_namsinh;
    const age =
      y != null && Number.isFinite(y) ? `${new Date().getFullYear() - Number(y)}` : dash;

    const cls = Array.isArray(api.chidinh) ? api.chidinh : [];
    const labResults = cls.map((lab) => {
      const tt = (lab.trangthai || '').trim();
      const done = tt === 'Đã hoàn thành' || tt.toLowerCase().includes('hoàn');
      return {
        name: lab.tendichvu || 'Chỉ định CLS',
        status: lab.trangthai || dash,
        date: visitDate,
        isNormal: done,
        note: lab.loaidichvu ? `Loại: ${lab.loaidichvu}` : undefined
      };
    });

    const rx = Array.isArray(api.donthuocChiTiet) ? api.donthuocChiTiet : [];
    const prescriptions = rx.map((m) => ({
      name: m.tenthuoc || 'Thuốc / vật tư',
      dosage: m.lieudung || dash,
      frequency: m.cachdung || dash,
      duration: m.soluong != null ? `${m.soluong}` : dash
    }));

    return {
      id: String(api.mahosokham),
      date: visitDate,
      patient: {
        name: api.benhnhan_hoten || 'Bệnh nhân',
        age,
        gender: api.benhnhan_gioitinh || dash,
        id: api.mabenhnhan != null ? `BN-${api.mabenhnhan}` : dash
      },
      doctor: {
        name: api.bacsiphutrach_ten || dash,
        department: api.khoakham || dash
      },
      vitals: {
        bloodPressure: dash,
        heartRate: dash,
        temperature: dash,
        weight: dash
      },
      diagnosis: api.ketluan || api.chandoansobo || dash,
      symptoms: api.trieuchungbandau || api.lydokham || dash,
      labResults:
        labResults.length > 0
          ? labResults
          : [
              {
                name: 'Không có chỉ định cận lâm sàng',
                status: dash,
                date: visitDate,
                isNormal: true
              }
            ],
      prescriptions:
        prescriptions.length > 0
          ? prescriptions
          : [
              {
                name: 'Không có đơn thuốc',
                dosage: dash,
                frequency: dash,
                duration: dash
              }
            ],
      advice: api.ketquacanlamsang || dash,
      followUpDate: formatDateVN(api.ngayhentaikham)
    };
  }, [api, id]);

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Hero Section */}
      <div className="bg-[#0B2046] text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/medicalrecords" className="inline-flex items-center gap-2 text-blue-200 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Quay lại danh sách
          </Link>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Kết quả khám bệnh</h1>
              <p className="text-blue-200">Mã hồ sơ: {record.id}</p>
            </div>
            <div className="flex gap-3">
              <button type="button" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded transition-colors">
                <Printer className="h-4 w-4" /> In kết quả
              </button>
              <button type="button" className="flex items-center gap-2 bg-[#0084FF] hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors shadow-lg">
                <Download className="h-4 w-4" /> Tải PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {loading ? (
          <div className="bg-white rounded shadow-sm border border-slate-100 p-12 text-center text-slate-600">
            Đang tải kết quả khám...
          </div>
        ) : error ? (
          <div className="bg-white rounded shadow-sm border border-slate-100 p-12 text-center text-red-600">
            {error}
          </div>
        ) : (
        <div className="bg-white rounded shadow-sm border border-slate-100 overflow-hidden">
          
          {/* General Info */}
          <div className="p-6 sm:p-8 border-b border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
                  <User className="h-6 w-6 text-[#0084FF]" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Thông tin bệnh nhân</p>
                  <h3 className="text-lg font-bold text-[#0B2046]">{record.patient.name}</h3>
                  <p className="text-slate-600">{record.patient.gender}, {record.patient.age} tuổi</p>
                  <p className="text-slate-500 text-sm mt-1">Mã BN: {record.patient.id}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center shrink-0">
                  <Stethoscope className="h-6 w-6 text-indigo-500" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Bác sĩ khám</p>
                  <h3 className="text-lg font-bold text-[#0B2046]">{record.doctor.name}</h3>
                  <p className="text-slate-600">{record.doctor.department}</p>
                  <p className="text-slate-500 text-sm mt-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Ngày khám: {record.date}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Vitals */}
          <div className="bg-slate-50 p-6 sm:p-8 border-b border-slate-100">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Chỉ số sinh tồn</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 text-red-500 mb-2">
                  <HeartPulse className="h-4 w-4" />
                  <span className="font-medium text-sm">Huyết áp</span>
                </div>
                <p className="text-xl font-bold text-[#0B2046]">{record.vitals.bloodPressure}</p>
              </div>
              <div className="bg-white p-4 rounded border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 text-orange-500 mb-2">
                  <Activity className="h-4 w-4" />
                  <span className="font-medium text-sm">Nhịp tim</span>
                </div>
                <p className="text-xl font-bold text-[#0B2046]">{record.vitals.heartRate}</p>
              </div>
              <div className="bg-white p-4 rounded border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 text-blue-500 mb-2">
                  <Thermometer className="h-4 w-4" />
                  <span className="font-medium text-sm">Nhiệt độ</span>
                </div>
                <p className="text-xl font-bold text-[#0B2046]">{record.vitals.temperature}</p>
              </div>
              <div className="bg-white p-4 rounded border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 text-green-500 mb-2">
                  <Weight className="h-4 w-4" />
                  <span className="font-medium text-sm">Cân nặng</span>
                </div>
                <p className="text-xl font-bold text-[#0B2046]">{record.vitals.weight}</p>
              </div>
            </div>
          </div>

          {/* Diagnosis & Symptoms */}
          <div className="p-6 sm:p-8 border-b border-slate-100">
            <div className="mb-6">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Triệu chứng lâm sàng</h4>
              <p className="text-slate-700">{record.symptoms}</p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Chẩn đoán</h4>
              <div className="bg-blue-50 border-l-4 border-[#0084FF] p-4 ">
                <p className="text-lg font-bold text-[#0B2046]">{record.diagnosis}</p>
              </div>
            </div>
          </div>

          {/* Lab Results */}
          <div className="p-6 sm:p-8 border-b border-slate-100">
            <h4 className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
              <FileBarChart className="h-4 w-4" /> Kết quả cận lâm sàng
            </h4>
            <div className="space-y-3">
              {record.labResults.map((lab, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded border border-slate-100 hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="font-medium text-[#0B2046]">{lab.name}</p>
                    {lab.note && (
                      <p className="text-sm text-orange-500 flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3" /> {lab.note}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      lab.isNormal === false ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {lab.status}
                    </span>
                    <p className="text-xs text-slate-400 mt-1">{lab.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prescription */}
          <div className="p-6 sm:p-8 border-b border-slate-100">
            <h4 className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
              <Pill className="h-4 w-4" /> Đơn thuốc
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-sm">
                    <th className="p-3 font-medium rounded">Tên thuốc</th>
                    <th className="p-3 font-medium">Liều dùng</th>
                    <th className="p-3 font-medium">Cách dùng</th>
                    <th className="p-3 font-medium">Số lượng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {record.prescriptions.map((med, index) => (
                    <tr key={index} className="text-slate-700">
                      <td className="p-3 font-medium text-[#0B2046]">{med.name}</td>
                      <td className="p-3">{med.dosage}</td>
                      <td className="p-3">{med.frequency}</td>
                      <td className="p-3">{med.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Advice & Follow-up */}
          <div className="p-6 sm:p-8 bg-blue-50/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Kết quả / ghi chú cận lâm sàng</h4>
                <p className="text-slate-700 leading-relaxed">{record.advice}</p>
              </div>
              <div className="md:text-right">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Lịch tái khám</h4>
                <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded border border-slate-200">
                  <Calendar className="h-5 w-5 text-[#0084FF]" />
                  <span className="font-bold text-[#0B2046]">{record.followUpDate}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
        )}
      </div>
    </div>
  );
}
