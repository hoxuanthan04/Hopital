
import React, { useState } from 'react';
import { Search, Calendar, ChevronDown, Plus, Maximize2 } from 'lucide-react';
import { Appointment } from '../../../types';
import Pagination from '../../components/admin/Pagination';

const MOCK_APPOINTMENTS: Appointment[] = [
  { id: '1', time: '9:30 AM', date: '05/12/2022', patientName: 'Elizabeth Polson', patientAge: 32, doctorName: 'Dr. John', status: 'Paid', avatar: 'https://picsum.photos/seed/p1/40/40' },
  { id: '2', time: '9:30 AM', date: '05/12/2022', patientName: 'John David', patientAge: 28, doctorName: 'Dr. Joel', status: 'UnPaid', avatar: 'https://picsum.photos/seed/p2/40/40' },
  { id: '3', time: '10:30 AM', date: '05/12/2022', patientName: 'Krishtav Rajan', patientAge: 24, doctorName: 'Dr. Joel', status: 'Paid', avatar: 'https://picsum.photos/seed/p3/40/40' },
  { id: '4', time: '11:00 AM', date: '05/12/2022', patientName: 'Sumanth Tinson', patientAge: 26, doctorName: 'Dr. John', status: 'UnPaid', avatar: 'https://picsum.photos/seed/p4/40/40' },
  { id: '5', time: '11:30 AM', date: '05/12/2022', patientName: 'EG Subramani', patientAge: 77, doctorName: 'Dr. John', status: 'UnPaid', avatar: 'https://picsum.photos/seed/p5/40/40' },
  { id: '6', time: '11:00 AM', date: '05/12/2022', patientName: 'Ranjan Maari', patientAge: 77, doctorName: 'Dr. John', status: 'UnPaid', avatar: 'https://picsum.photos/seed/p6/40/40' },
  { id: '7', time: '11:00 AM', date: '05/12/2022', patientName: 'Philipile Gopal', patientAge: 55, doctorName: 'Dr. John', status: 'Paid', avatar: 'https://picsum.photos/seed/p7/40/40' },
];

const Appointments: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'New' | 'Completed'>('Completed');
  const [search, setSearch] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filteredAppointments = MOCK_APPOINTMENTS.filter(app => 
    app.patientName.toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAppointments.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-bold text-slate-800">Appointments</h2>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-all active:scale-95">
          <Plus size={20} />
          New Appointment
        </button>
      </div>

      <div className="bg-white rounded shadow-sm p-6 overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-8 border-b border-slate-50">
          <div className="flex gap-8">
            {['NEW APPOINTMENTS', 'COMPLETED APPOINTMENTS'].map((tab) => {
              const tabKey = tab.startsWith('NEW') ? 'New' : 'Completed';
              const isActive = activeTab === tabKey;
              return (
                <button 
                  key={tab}
                  onClick={() => {
                    setActiveTab(tabKey);
                    setCurrentPage(1);
                  }}
                  className={`pb-4 text-sm font-bold tracking-wider transition-all border-b-2 ${
                    isActive ? 'text-slate-800 border-blue-600' : 'text-slate-400 border-transparent hover:text-slate-600'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
          <Maximize2 size={18} className="text-blue-500 cursor-pointer" />
        </div>

        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search appointments..." 
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-transparent focus:border-blue-500 rounded outline-none"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="flex gap-4">
            <button className="flex items-center gap-3 px-6 py-3 border border-blue-500 text-blue-500 font-medium rounded">
              Filter by Date <Calendar size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto -mx-6">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-50">
                <th className="py-4 px-6">Time <ChevronDown size={14} className="inline ml-1" /></th>
                <th className="py-4 px-4 text-center">Date <ChevronDown size={14} className="inline ml-1" /></th>
                <th className="py-4 px-6">Patient Name <ChevronDown size={14} className="inline ml-1" /></th>
                <th className="py-4 px-4 text-center">Patient Age <ChevronDown size={14} className="inline ml-1" /></th>
                <th className="py-4 px-4 text-center">Doctor <ChevronDown size={14} className="inline ml-1" /></th>
                <th className="py-4 px-4 text-center">Fee Status <ChevronDown size={14} className="inline ml-1" /></th>
                <th className="py-4 px-6 text-center">User Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {currentItems.map((app) => (
                <tr key={app.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 font-semibold text-slate-700">{app.time}</td>
                  <td className="py-4 px-4 text-center text-slate-600 font-medium">{app.date}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      <img src={app.avatar} alt="" className="w-10 h-10 rounded-full shadow-sm" />
                      <span className="font-semibold text-slate-800">{app.patientName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center text-slate-600 font-medium">{app.patientAge}</td>
                  <td className="py-4 px-4 text-center text-slate-600 font-medium">{app.doctorName}</td>
                  <td className="py-4 px-4 text-center">
                    <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                      app.status === 'Paid' ? 'text-slate-500' : 'text-slate-300'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <button className="text-blue-500 font-bold hover:underline">Request Fee</button>
                  </td>
                </tr>
              ))}
              {currentItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">No appointments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination 
          totalItems={filteredAppointments.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default Appointments;
