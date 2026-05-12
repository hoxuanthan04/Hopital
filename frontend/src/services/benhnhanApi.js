import axios from "axios";

const root = import.meta.env.VITE_API_BASE_URL;
const API_URL = root
  ? `${String(root).replace(/\/$/, '')}/api/benhnhan`
  : '/api/benhnhan';

export const getBenhNhan = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

/** Tra cứu bệnh nhân theo CCCD. Ném lỗi axios nếu 404. */
export const lookupBenhNhanByCccd = async (q) => {
  const res = await axios.get(`${API_URL}/lookup/cccd`, { params: { q } });
  return res.data;
};

/** Kiểm tra SĐT đã gắn với bệnh nhân khác chưa. */
export const lookupDienthoaiInUse = async (q, excludeMabenhnhan) => {
  const res = await axios.get(`${API_URL}/lookup/dienthoai`, {
    params: { q, ...(excludeMabenhnhan != null ? { exclude: excludeMabenhnhan } : {}) },
  });
  return res.data;
};

export const addBenhNhan = async (data) => {
  const res = await axios.post(API_URL, data);
  return res.data;
};

export const deleteBenhNhan = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
};