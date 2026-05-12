import axios from 'axios';

const API_URL = 'http://localhost:5000/api/phongkham'; // Cổng port backend của bạn

const PhongKhamService = {
  // Lấy toàn bộ danh sách
  getAll: async () => {
    const response = await axios.get(API_URL);
    return response.data;
  },

  update: async (id, data) => {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
  },
  // Tạo mới phòng khám
  create: async (data) => {
    const response = await axios.post(API_URL, data);
    return response.data;
  },

  // Xóa phòng khám theo ID
  delete: async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  },

  /** Tra phòng theo mamayphong (định danh máy trạm) */
  getByMachineCode: async (mamayphong) => {
    const enc = encodeURIComponent(String(mamayphong).trim());
    const response = await axios.get(`${API_URL}/by-machine/${enc}`);
    return response.data;
  },
};

export default PhongKhamService;