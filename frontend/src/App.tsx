import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// --- LAYOUTS ---
import AdminLayout from './layouts/AdminLayout';
import StaffLayout from './layouts/StaffLayout';
import Navbar from './components/client/Navbar';
import Footer from './components/client/Footer';
import Chatbox from './components/client/Chatbox';

// --- PAGES CLIENT ---
import Home from './pages/client/Home';
import About from './pages/client/About';
import Services from './pages/client/Services';
import Doctors from './pages/client/Doctors';
import Contact from './pages/client/Contact';
import Login from './pages/client/Login';
import Register from './pages/client/Register';
import BookAppointment from './pages/client/BookAppointment';
import Department from './pages/client/Department';
import MedicalResults from './pages/client/MedicalResults';
import MedicalRecords from './pages/client/MedicalRecords';
import BenhNhanPage from './pages/client/BenhNhanPage';
import Unauthorized from './pages/client/Unauthorized';

// --- PAGES ADMIN ---
import Dashboard from './pages/admin/Dashboard';
import Patients from './pages/admin/Patients';
import SettingsPage from './pages/admin/SettingsPage';
import Appointments from './pages/staff/AppointmentsManager';
import DoctorsAdmin from './pages/admin/Doctors';
import Inventory from './pages/admin/Inventory';
import Rooms from './pages/admin/Rooms';
import Accounts from './pages/admin/Accounts';
import Schedules from './pages/admin/Schedules';
import MyWorkSchedule from './pages/staff/MyWorkSchedule';
import Subclinical from './pages/admin/CanLamSang'

// --- PAGES STAFF ---
import HomeStaff from './pages/staff/Home';
import RegisterExamination from './pages/staff/RegisterExamination';
import AppointmentsManager from './pages/staff/AppointmentsManager';
import InvoiceManagement from './pages/staff/InvoiceManagement';
import Examination from './pages/staff/Examination'
import GoiSo from './pages/staff/GoiSo';
import PatientQueue from './pages/staff/PatientQueue'
import DiagnosticImaging from './pages/staff/DiagnosticImaging'

// --- COMPONENTS ---
import ProtectedRoute from './components/ProtectedRoute';
import ChuyenKhoa from './pages/admin/Departments';

// Layout dành cho khách hàng (có Navbar & Footer)
const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen font-sans text-slate-800 bg-slate-50">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <Chatbox />
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        {/* ==========================================================
            1. AUTH ROUTES (Không dùng chung Layout)
           ========================================================== */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path='/staff/goiso' element={<GoiSo />} />
        
        {/* ==========================================================
            2. CLIENT ROUTES (Công khai cho khách hàng)
           ========================================================== */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/book-appointment" element={<BookAppointment />} />
          <Route path='/department' element={<Department/>}/>
          <Route path='/benhnhan' element={<BenhNhanPage/>}/>

          <Route element={<ProtectedRoute allowedRoles={['client']} />}>
            <Route path='/medicalrecords' element={<MedicalRecords/>}/>
            <Route path='/medicalresults/:id' element={<MedicalResults/>}/>
          </Route>

        </Route>

        {/* ==========================================================
            3. ADMIN ROUTES (Chỉ dành cho Admin)
           ========================================================== */}
        <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
          <Route element={<AdminLayout />}>
            <Route path='/admin/dashboard' element={<Dashboard />} />
            <Route path='/admin/patients' element={<Patients />} />
            <Route path='/admin/settings' element={<SettingsPage />} />
            <Route path='/admin/appointments' element={<Appointments />} />
            <Route path='/admin/customers' element={<DoctorsAdmin />} />
            <Route path='/admin/inventory' element={<Inventory />} />
            <Route path='/admin/rooms' element={<Rooms />} />
            <Route path='/admin/accounts' element={<Accounts />} />
            <Route path='/admin/schedules' element={<Schedules />} />
            <Route path='/admin/departments' element={<ChuyenKhoa/>}/>
            <Route path='/admin/subclinical' element={<Subclinical/>}/>

          </Route>
        </Route>

        {/* ==========================================================
            4. STAFF ROUTES (Chỉ dành cho Nhân viên)
           ========================================================== */}
        <Route element={<ProtectedRoute allowedRoles={['Staff', 'Bác sĩ']} />}>
          <Route element={<StaffLayout />}>
            <Route path='/staff/home' element={<HomeStaff />} />
            <Route path='/staff/registerexamination' element={<RegisterExamination />} />
            <Route path='/staff/appointmentsmanager' element={<AppointmentsManager />} />
            <Route path='/staff/invoicemanagement' element={<InvoiceManagement />} />
            <Route path='/staff/settings' element={<SettingsPage />} />
            <Route path='/staff/my-schedule' element={<MyWorkSchedule />} />
            <Route path='/staff/schedules' element={<Navigate to="/staff/my-schedule" replace />} />
            <Route path='/staff/examination' element={<Examination />} />
            <Route path='/staff/patientqueue' element={<PatientQueue/>}/>
            <Route path='/staff/diagnostic-imaging' element={<DiagnosticImaging/>}/>
          </Route>
        </Route>

        {/* ==========================================================
            5. FALLBACK ROUTE (Trang không tồn tại)
           ========================================================== */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}