
import React, { useState, useEffect, useCallback } from 'react';
import { PieChart, Pie, Cell, LineChart, ResponsiveContainer, Tooltip, BarChart, Bar, YAxis, CartesianGrid, XAxis, Line, ReferenceLine } from 'recharts';
import { FileText, Users, Pill, TestTube, ChevronDown, LayoutGrid, CheckCircle2, Wrench } from 'lucide-react';
import ShareContentModal from '../../components/admin/ShareContentModal';
import PhongKhamService from '../../services/phongkham.service';
import DashboardService from '../../services/dashboard.service';

type StatCard = {
  label: string;
  value: string;
  icon: typeof FileText;
  color: string;
  bg: string;
};

type BarDatum = { name: string; patients: number; revenue: number };
type PieDatum = { name: string; value: number; color: string; rawCount?: number };
type LineDatum = { month: string; patients: number };

type ApiOverview = {
  summary: { luotKham: number; benhNhan: number; doanhThu: number; canLamSang: number };
  khoaStats: { name: string; patients: number; revenue?: number }[];
  monthlyLuotKham: LineDatum[];
  year: number;
};

const DEFAULT_BAR: BarDatum[] = [
  { name: 'Nội tổng quát', patients: 400, revenue: 2400 },
  { name: 'Nhi khoa', patients: 300, revenue: 1398 },
  { name: 'Sản phụ khoa', patients: 200, revenue: 9800 },
  { name: 'Răng hàm mặt', patients: 278, revenue: 3908 },
  { name: 'Tai mũi họng', patients: 189, revenue: 4800 },
  { name: 'Da liễu', patients: 239, revenue: 3800 },
];

const BAR_GREYS = ['#9CA3AF', '#94a3b8', '#64748b', '#cbd5e1', '#a8a29e', '#78716c', '#94a3b8', '#475569'];

const DEFAULT_STATS: StatCard[] = [
  { label: 'Lượt khám', value: '1k+', icon: FileText, color: 'text-gray-600', bg: 'bg-gray-100' },
  { label: 'Bệnh nhân mới', value: '50', icon: Users, color: 'text-gray-600', bg: 'bg-gray-100' },
  { label: 'Doanh thu', value: '520 triệu', icon: Pill, color: 'text-gray-600', bg: 'bg-gray-100' },
  { label: 'Cận lâm sàng', value: '100', icon: TestTube, color: 'text-gray-600', bg: 'bg-gray-100' },
];

const DEFAULT_PIE: PieDatum[] = [
  { name: 'Paracetamol', value: 55, color: '#DBEAFE' },
  { name: 'Vitamin Tablets', value: 25, color: '#A855F7' },
  { name: 'Antacid Tablets', value: 12, color: '#22C55E' },
  { name: 'Others', value: 8, color: '#FACC15' },
];

const DEFAULT_LINE: LineDatum[] = [
  { month: 'T1', patients: 320 },
  { month: 'T2', patients: 280 },
  { month: 'T3', patients: 390 },
  { month: 'T4', patients: 1000 },
  { month: 'T5', patients: 0 },
  { month: 'T6', patients: 0 },
  { month: 'T7', patients: 0 },
  { month: 'T8', patients: 0 },
  { month: 'T9', patients: 0 },
  { month: 'T10', patients: 0 },
  { month: 'T11', patients: 0 },
  { month: 'T12', patients: 0 },
];

const PIE_COLORS = ['#DBEAFE', '#A855F7', '#22C55E', '#FACC15'];

const fmtVi = (n: number) =>
  new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(n);

const formatDoanhThuShort = (n: number) => {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} tỷ`;
  if (n >= 1_000_000) return `${Math.max(1, Math.round(n / 1_000_000))} triệu`;
  return `${fmtVi(n)} ₫`;
};

const EMPTY_BAR: BarDatum[] = [{ name: 'Chưa có dữ liệu', patients: 0, revenue: 0 }];
const EMPTY_PIE: PieDatum[] = [{ name: 'Chưa có dữ liệu', value: 100, color: '#e2e8f0', rawCount: 0 }];

const Dashboard: React.FC = () => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'New' | 'Completed'>('New');
  const [rooms, setRooms] = useState<Array<{ trangthai?: string | null }>>([]);

  const [barData, setBarData] = useState<BarDatum[]>(DEFAULT_BAR);
  const [statsCards, setStatsCards] = useState<StatCard[]>(DEFAULT_STATS);
  const [pieData, setPieData] = useState<PieDatum[]>(DEFAULT_PIE);
  const [lineData, setLineData] = useState<LineDatum[]>(DEFAULT_LINE);
  const [pieTotalDisplay, setPieTotalDisplay] = useState('745');

  const applyOverview = useCallback((dash: ApiOverview) => {
    const s = dash.summary;
    setStatsCards([
      { label: 'Lượt khám', value: fmtVi(s.luotKham), icon: FileText, color: 'text-gray-600', bg: 'bg-gray-100' },
      { label: 'Bệnh nhân mới', value: fmtVi(s.benhNhan), icon: Users, color: 'text-gray-600', bg: 'bg-gray-100' },
      { label: 'Doanh thu', value: formatDoanhThuShort(s.doanhThu), icon: Pill, color: 'text-gray-600', bg: 'bg-gray-100' },
      { label: 'Cận lâm sàng', value: fmtVi(s.canLamSang), icon: TestTube, color: 'text-gray-600', bg: 'bg-gray-100' },
    ]);

    const rawKhoa = dash.khoaStats ?? [];
    const totalPatients = rawKhoa.reduce((a, k) => a + k.patients, 0);

    if (rawKhoa.length > 0) {
      const bars: BarDatum[] = rawKhoa.map((k) => ({
        name: k.name,
        patients: k.patients,
        revenue: typeof k.revenue === 'number' ? k.revenue : 0,
      }));
      setBarData(bars);

      if (totalPatients > 0) {
        const slices: PieDatum[] = rawKhoa.map((k, i) => ({
          name: k.name,
          value: Math.max(0, Math.round((k.patients / totalPatients) * 100)),
          color: PIE_COLORS[i % PIE_COLORS.length],
          rawCount: k.patients,
        }));
        const diff = 100 - slices.reduce((a, p) => a + p.value, 0);
        if (slices.length && diff !== 0) {
          let idx = slices.length - 1;
          while (idx >= 0 && (slices[idx].rawCount ?? 0) === 0) idx -= 1;
          if (idx < 0) idx = slices.length - 1;
          const t = slices[idx];
          slices[idx] = { ...t, value: t.value + diff };
        }
        setPieData(slices);
        setPieTotalDisplay(fmtVi(totalPatients));
      } else {
        const n = rawKhoa.length;
        const base = Math.floor(100 / n);
        const remainder = 100 - base * n;
        const slices: PieDatum[] = rawKhoa.map((k, i) => ({
          name: k.name,
          value: base + (i < remainder ? 1 : 0),
          color: PIE_COLORS[i % PIE_COLORS.length],
          rawCount: 0,
        }));
        setPieData(slices);
        setPieTotalDisplay('0');
      }
    } else {
      setBarData(EMPTY_BAR);
      setPieData(EMPTY_PIE);
      setPieTotalDisplay('0');
    }

    const monthly =
      dash.monthlyLuotKham?.length === 12
        ? dash.monthlyLuotKham
        : DEFAULT_LINE.map((d, i) => ({
            month: d.month,
            patients: dash.monthlyLuotKham?.[i]?.patients ?? d.patients,
          }));
    setLineData(monthly);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const [dash, roomsData] = await Promise.all([
          DashboardService.getOverview(),
          PhongKhamService.getAll(),
        ]);
        setRooms(Array.isArray(roomsData) ? roomsData : []);
        applyOverview(dash as ApiOverview);
      } catch (e) {
        console.error('Dashboard / phòng:', e);
        try {
          const roomsData = await PhongKhamService.getAll();
          setRooms(Array.isArray(roomsData) ? roomsData : []);
        } catch (_) {
          /* giữ fallback dữ liệu biểu đồ */
        }
      }
    };
    load();
  }, [applyOverview]);

  const stats_phong = {
    total: rooms.length,
    active: rooms.filter((r) => r.trangthai === 'Đang hoạt động' || r.trangthai === 'Sẵn sàng').length,
    empty: rooms.filter((r) => r.trangthai === 'Trống').length,
    maintenance: rooms.filter((r) => r.trangthai === 'Đang sửa chữa' || r.trangthai === 'Bảo trì').length,
  };

  const stats = [
    {
      label: 'Tổng số phòng',
      value: stats_phong.total || 0,
      icon: LayoutGrid,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Đang hoạt động',
      value: stats_phong.active || 0,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      label: 'Phòng trống',
      value: stats_phong.empty || 0,
      icon: CheckCircle2,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      label: 'Đang bảo trì',
      value: stats_phong.maintenance || 0,
      icon: Wrench,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
    },
  ];

  const lineAvg =
    lineData.length > 0
      ? Math.round(lineData.reduce((a, x) => a + x.patients, 0) / lineData.length)
      : 0;

  return (
    <div className="space-y-6 min-w-0">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-w-0">
        {/* Activity Overview */}
        <div className="lg:col-span-5 min-w-0 bg-white p-6 rounded shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800">Tổng quan</h2>
            <button className="flex items-center gap-1 text-sm text-slate-500 font-medium px-2 py-1 border border-slate-100 rounded-lg">
              Hôm nay <ChevronDown size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {statsCards.map((stat, idx) => (
              <div key={idx} className={`${stat.bg} p-6 rounded flex flex-col items-center justify-center transition-transform hover:scale-[1.02]`}>
                <div className="w-10 h-10 bg-white rounded flex items-center justify-center shadow-sm mb-3">
                  <stat.icon className={stat.color} size={20} />
                </div>
                <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Appointments Widget */}
        <div className="lg:col-span-7 min-w-0 bg-white p-6 rounded shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-6 border-b border-slate-50">
              <button
                type="button"
                onClick={() => setActiveTab('New')}
                className={`pb-2 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'New' ? 'border-blue-600 text-slate-800' : 'border-transparent text-slate-400'}`}
              >
                Lượt khám mới
              </button>
              {/* <button 
                onClick={() => setActiveTab('Completed')}
                className={`pb-2 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'Completed' ? 'border-blue-600 text-slate-800' : 'border-transparent text-slate-400'}`}
              >
                Completed Appointments
              </button> */}
            </div>
            {/* <Maximize2 size={16} className="text-blue-500 cursor-pointer" /> */}
          </div>

          <div className="overflow-x-auto min-w-0">
            <div className="h-[330px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280}>
                <BarChart data={barData} margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    interval={0}
                  />

                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />

                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number, name: string, item: { payload?: BarDatum }) => {
                      const row = item?.payload;
                      if (name === 'patients' || name === 'Số lượng bệnh nhân') {
                        const rev = row?.revenue != null && row.revenue > 0 ? formatDoanhThuShort(row.revenue) : null;
                        return rev ? [`${fmtVi(value)} hồ sơ`, `Doanh thu (phân bổ): ${rev}`] : [`${fmtVi(value)} hồ sơ`, 'Số hồ sơ theo khoa'];
                      }
                      return [fmtVi(Number(value)), name];
                    }}
                  />

                  <Bar dataKey="patients" name="Số lượng bệnh nhân" radius={[0, 0, 0, 0]} barSize={40}>
                    {barData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={BAR_GREYS[index % BAR_GREYS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-w-0">
        <div className="bg-white p-6 rounded shadow-sm flex flex-col min-w-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800  ">Trạng thái phòng</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 w-full max-w-4xl mx-auto">
            {stats.map((item, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center transition-all hover:shadow-md hover:-translate-y-1"
              >
                <h3 className="text-[26px] font-extrabold text-slate-800 mb-1">{item.value}</h3>
                <p className="text-slate-500 font-semibold tracking-wide uppercase text-xs">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white max-h-[300px] min-w-0 p-6 rounded shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800">Lượt khám khoa</h2>
            <div className="flex items-center gap-3" />
          </div>
          <div className="h-32 relative w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={120}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, _n: string, item: { payload?: PieDatum }) => {
                    const raw = item?.payload?.rawCount;
                    if (raw != null && raw > 0) return [`${value}% (${fmtVi(raw)} hồ sơ)`, 'Tỷ lệ'];
                    if (raw === 0) return ['0 hồ sơ', 'Tỷ lệ'];
                    return [`${value}%`, 'Tỷ lệ'];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-xs text-slate-400 font-medium">TOTAL</p>
                <p className="text-xl font-bold text-slate-800">{pieTotalDisplay}</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-2">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs font-medium text-slate-600">{item.name}</span>
                <span className="text-xs font-bold text-slate-800 ml-auto">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded shadow-sm min-w-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800">Lượng bệnh nhân</h2>
          </div>
          <div className="space-y-4 h-[200px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={180}>
              <LineChart data={lineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                  padding={{ left: 20, right: 20 }}
                />

                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} width={40} />

                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                    padding: '12px',
                  }}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}
                  itemStyle={{ color: '#324047' }}
                  formatter={(value: number) => [`${fmtVi(value)} lượt`, 'Lượt khám trong tháng']}
                  labelFormatter={(label: string) => `Tháng ${label.substring(1)}`}
                />

                {lineAvg > 0 && (
                  <ReferenceLine
                    y={lineAvg}
                    label={{ value: `TB: ${lineAvg}`, fill: '#94a3b8', fontSize: 11, position: 'right' }}
                    stroke="#cbd5e1"
                    strokeDasharray="3 3"
                  />
                )}

                <Line
                  type="monotone"
                  dataKey="patients"
                  name="Lượng bệnh nhân"
                  stroke="#94a3b8"
                  strokeWidth={3}
                  dot={{ r: 5, strokeWidth: 3, fill: 'white' }}
                  activeDot={{ r: 6, stroke: '#0284c7', strokeWidth: 2, fill: 'white' }}
                  isAnimationActive={true}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {isShareModalOpen && <ShareContentModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} />}
    </div>
  );
};

export default Dashboard;
