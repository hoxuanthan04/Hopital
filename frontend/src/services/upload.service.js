import axios from 'axios';

const root = import.meta.env.VITE_API_BASE_URL;
const base = root ? String(root).replace(/\/$/, '') : '';

/**
 * Đẩy ảnh lên Cloudinary qua backend (POST /api/upload/single).
 * @param {File} file
 * @param {'bacsi'|'nhanvien'|'general'} [type='bacsi']
 * @returns {Promise<{ url: string, publicId?: string }>}
 */
export async function uploadImageSingle(file, type = 'bacsi') {
  const fd = new FormData();
  fd.append('image', file);
  const url = `${base}/api/upload/single?type=${encodeURIComponent(type)}`;
  const res = await axios.post(url, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  });
  return res.data;
}
