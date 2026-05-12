import axios from 'axios';

const root = import.meta.env.VITE_API_BASE_URL;
const base = root ? String(root).replace(/\/$/, '') : 'http://localhost:5000';

function authHeaders() {
  const t = localStorage.getItem('token');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

/** Admin: tạo thông báo. */
export async function createThongBao(body) {
  const res = await axios.post(`${base}/api/thongbao`, body, { headers: { ...authHeaders() } });
  return res.data;
}

/** Danh sách thông báo của tài khoản đang đăng nhập. */
export async function listMine(params = {}) {
  const res = await axios.get(`${base}/api/thongbao/mine`, {
    params,
    headers: { ...authHeaders() },
  });
  return res.data;
}

export async function getUnreadCount() {
  const res = await axios.get(`${base}/api/thongbao/unread-count`, { headers: { ...authHeaders() } });
  const n = Number(res.data?.count);
  return Number.isFinite(n) ? n : 0;
}

export async function markThongBaoRead(id) {
  await axios.patch(`${base}/api/thongbao/${id}/read`, {}, { headers: { ...authHeaders() } });
}

export async function markAllThongBaoRead() {
  await axios.patch(`${base}/api/thongbao/read-all`, {}, { headers: { ...authHeaders() } });
}

/** Admin: lịch sử gửi gần đây. */
export async function listAdminThongBao(limit = 50) {
  const res = await axios.get(`${base}/api/thongbao/admin-list`, {
    params: { limit },
    headers: { ...authHeaders() },
  });
  return res.data;
}
