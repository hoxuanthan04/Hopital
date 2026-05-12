import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-5">
      <div className="max-w-md w-full text-center bg-white p-10 rounded shadow-xl">
        
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Truy cập bị từ chối</h1>
        <p className="text-slate-600 mb-8">
          Bạn không có quyền hạn để truy cập vào trang này. Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là một lỗi.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#0084FF] text-white font-semibold rounded hover:bg-blue-600 transition-all shadow-lg shadow-blue-200"
        >
          Quay lại trang trước
        </button>
      </div>
    </div>
  );
}