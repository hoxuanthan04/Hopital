import pool from "../config/db.js";
import * as ThongBaoModel from "../models/thongbao.model.js";

function normStr(s) {
  return String(s ?? "").trim();
}

async function selectRecipients({ loai, vai_tro, mataikhoan }) {
  if (loai === "tat_ca") {
    const r = await pool.query(
      `
      SELECT mataikhoan FROM taikhoan
      WHERE (isdelete IS NULL OR isdelete = false)
        AND COALESCE(trangthai, '') = 'Hoạt động'
      `
    );
    return [...new Set(r.rows.map((x) => Number(x.mataikhoan)).filter((n) => n > 0))];
  }
  if (loai === "vai_tro") {
    const roles = Array.isArray(vai_tro) ? vai_tro.map((x) => normStr(x)).filter(Boolean) : [];
    if (!roles.length) throw new Error("Chọn ít nhất một vai trò nhận thông báo.");
    const r = await pool.query(
      `
      SELECT mataikhoan FROM taikhoan
      WHERE (isdelete IS NULL OR isdelete = false)
        AND COALESCE(trangthai, '') = 'Hoạt động'
        AND loaitaikhoan = ANY($1::text[])
      `,
      [roles]
    );
    const ids = [...new Set(r.rows.map((x) => Number(x.mataikhoan)).filter((n) => n > 0))];
    if (!ids.length) throw new Error("Không có tài khoản nào khớp vai trò đã chọn.");
    return ids;
  }
  if (loai === "chon") {
    const ids = (Array.isArray(mataikhoan) ? mataikhoan : [])
      .map((x) => Number(x))
      .filter((n) => Number.isFinite(n) && n > 0);
    if (!ids.length) throw new Error("Chọn ít nhất một tài khoản nhận thông báo.");
    const r = await pool.query(
      `
      SELECT mataikhoan FROM taikhoan
      WHERE mataikhoan = ANY($1::int[])
        AND (isdelete IS NULL OR isdelete = false)
      `,
      [ids]
    );
    const ok = [...new Set(r.rows.map((x) => Number(x.mataikhoan)))];
    if (!ok.length) throw new Error("Các tài khoản đã chọn không hợp lệ hoặc đã bị xóa.");
    return ok;
  }
  throw new Error("Loại đối tượng nhận không hợp lệ (tat_ca | vai_tro | chon).");
}

export async function createThongBaoByAdmin(nguoi_tao, { tieu_de, noi_dung, doi_tuong }) {
  const td = normStr(tieu_de);
  const nd = normStr(noi_dung);
  if (!td) throw new Error("Thiếu tiêu đề.");
  if (!nd) throw new Error("Thiếu nội dung.");
  const dt = doi_tuong && typeof doi_tuong === "object" ? doi_tuong : {};
  const loai = normStr(dt.loai).toLowerCase() || "tat_ca";
  const recipients = await selectRecipients({
    loai: loai === "vai_tro" ? "vai_tro" : loai === "chon" ? "chon" : "tat_ca",
    vai_tro: dt.vai_tro,
    mataikhoan: dt.mataikhoan,
  });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const row = await ThongBaoModel.insertThongBao(client, {
      tieu_de: td.slice(0, 280),
      noi_dung: nd,
      nguoi_tao: nguoi_tao != null ? Number(nguoi_tao) : null,
    });
    await ThongBaoModel.insertNhieuNguoiNhan(client, row.id, recipients);
    await client.query("COMMIT");
    return {
      id: row.id,
      tieu_de: row.tieu_de,
      so_nguoi_nhan: recipients.length,
      created_at: row.created_at,
    };
  } catch (e) {
    await client.query("ROLLBACK");
    if (e && e.code === "42P01") {
      throw new Error("Chưa có bảng thông báo. Chạy migration backend/migrations/004_thong_bao.sql.");
    }
    throw e;
  } finally {
    client.release();
  }
}

export const listMine = (mataikhoan, q) => ThongBaoModel.listForUser(mataikhoan, q);
export const unreadCount = (mataikhoan) => ThongBaoModel.countUnread(mataikhoan);
export const markRead = (mataikhoan, thong_bao_id) => ThongBaoModel.markRead(mataikhoan, thong_bao_id);
export const markAllRead = (mataikhoan) => ThongBaoModel.markAllRead(mataikhoan);
export const listAllAdmin = (limit) => ThongBaoModel.listAllForAdmin(limit);
