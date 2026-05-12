import axios from 'axios';

// Dùng đường dẫn tương đối để Vite proxy (/api -> backend). Có thể ghi đè bằng VITE_API_BASE_URL (vd: http://localhost:5000).
const root = import.meta.env.VITE_API_BASE_URL;
const API_URL = root
  ? `${String(root).replace(/\/$/, '')}/api/lichlamviec`
  : '/api/lichlamviec';

const LichLamViecService = {
  getByNgay: async (ngay) => {
    const res = await axios.get(API_URL, { params: { ngay } });
    return res.data;
  },

  /** Lịch một nhân viên trong khoảng ngày (YYYY-MM-DD). */
  getCaNhan: async (manhanvien, tungay, denngay) => {
    const res = await axios.get(`${API_URL}/ca-nhan`, {
      params: { manhanvien, tungay, denngay },
    });
    return res.data;
  },

  create: async (body) => {
    const res = await axios.post(API_URL, body);
    return res.data;
  },

  update: async (id, body) => {
    const res = await axios.put(`${API_URL}/${id}`, body);
    return res.data;
  },

  delete: async (id) => {
    const res = await axios.delete(`${API_URL}/${id}`);
    return res.data;
  },
};

export default LichLamViecService;
