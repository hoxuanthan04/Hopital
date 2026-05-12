import axios from 'axios';

const root = import.meta.env.VITE_API_BASE_URL;
const API_URL = root
  ? `${String(root).replace(/\/$/, '')}/api/hoadon`
  : '/api/hoadon';

const HoaDonService = {
  getAll: async () => {
    const res = await axios.get(API_URL);
    return res.data;
  },

  /** Hồ sơ trạng thái «Chờ thanh toán» (sau hoàn tất khám). */
  getHosoChoThanhToan: async () => {
    const res = await axios.get(`${API_URL}/hoso-cho-thanh-toan`);
    return res.data;
  },

  previewHosoInvoice: async (mahosokham) => {
    const res = await axios.get(`${API_URL}/preview-hoso/${mahosokham}`);
    return res.data;
  },

  createFromHoSo: async (body) => {
    const res = await axios.post(`${API_URL}/from-hoso`, body);
    return res.data;
  },

  getById: async (id) => {
    const res = await axios.get(`${API_URL}/${id}`);
    return res.data;
  },

  getChiTiet: async (id) => {
    const res = await axios.get(`${API_URL}/${id}/chitiet`);
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

  /** Trả về { checkoutUrl, qrCode, orderCode, amount, paymentLinkId } */
  createPayosLink: async (id) => {
    const res = await axios.post(`${API_URL}/${id}/payos-link`);
    return res.data;
  },
};

export default HoaDonService;
