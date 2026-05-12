import axios from 'axios';

const root = import.meta.env.VITE_API_BASE_URL;
const API_URL = root
  ? `${String(root).replace(/\/$/, '')}/api/vattu`
  : '/api/vattu';

const VattuService = {
  getAll: async () => {
    const response = await axios.get(API_URL);
    return response.data;
  },

  /** Lọc theo loại vật tư (vd: thuốc) — backend ILIKE %pattern% */
  getByLoaiVattu: async (loai) => {
    const response = await axios.get(API_URL, { params: { loaivattu: loai } });
    return response.data;
  },

  getById: async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await axios.post(API_URL, data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  },
};

export default VattuService;
