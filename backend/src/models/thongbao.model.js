import pool from "../config/db.js";

export const insertThongBao = async (client, { tieu_de, noi_dung, nguoi_tao }) => {
  const q = client || pool;
  const r = await q.query(
    `INSERT INTO thong_bao (tieu_de, noi_dung, nguoi_tao)
     VALUES ($1, $2, $3) RETURNING *`,
    [tieu_de, noi_dung, nguoi_tao ?? null]
  );
  return r.rows[0];
};

export const insertNhieuNguoiNhan = async (client, thong_bao_id, mataikhoanIds) => {
  if (!mataikhoanIds.length) return 0;
  const q = client || pool;
  const r = await q.query(
    `
    INSERT INTO thong_bao_nhan (thong_bao_id, mataikhoan, da_doc)
    SELECT $1, x, false
    FROM unnest($2::int[]) AS x
    ON CONFLICT (thong_bao_id, mataikhoan) DO NOTHING
    `,
    [thong_bao_id, mataikhoanIds]
  );
  return r.rowCount ?? 0;
};

export const listForUser = async (mataikhoan, { limit = 40, offset = 0 } = {}) => {
  const r = await pool.query(
    `
    SELECT tb.id,
           tb.tieu_de,
           tb.noi_dung,
           tb.created_at,
           tbn.da_doc,
           tbn.read_at
    FROM thong_bao tb
    INNER JOIN thong_bao_nhan tbn ON tbn.thong_bao_id = tb.id
    WHERE tbn.mataikhoan = $1
    ORDER BY tb.created_at DESC
    LIMIT $2 OFFSET $3
    `,
    [mataikhoan, Math.min(100, Math.max(1, Number(limit) || 40)), Math.max(0, Number(offset) || 0)]
  );
  return r.rows;
};

export const countUnread = async (mataikhoan) => {
  const r = await pool.query(
    `SELECT COUNT(*)::int AS c FROM thong_bao_nhan WHERE mataikhoan = $1 AND da_doc = false`,
    [mataikhoan]
  );
  return r.rows[0]?.c ?? 0;
};

export const markRead = async (mataikhoan, thong_bao_id) => {
  const r = await pool.query(
    `
    UPDATE thong_bao_nhan
    SET da_doc = true, read_at = COALESCE(read_at, now())
    WHERE mataikhoan = $1 AND thong_bao_id = $2 AND da_doc = false
    RETURNING *
    `,
    [mataikhoan, thong_bao_id]
  );
  return r.rows[0] ?? null;
};

export const markAllRead = async (mataikhoan) => {
  const r = await pool.query(
    `
    UPDATE thong_bao_nhan
    SET da_doc = true, read_at = COALESCE(read_at, now())
    WHERE mataikhoan = $1 AND da_doc = false
    `,
    [mataikhoan]
  );
  return r.rowCount ?? 0;
};

export const listAllForAdmin = async (limit = 80) => {
  const lim = Math.min(200, Math.max(1, Number(limit) || 80));
  const r = await pool.query(
    `
    SELECT tb.id,
           tb.tieu_de,
           left(tb.noi_dung, 200) AS noi_dung_rut_gon,
           tb.created_at,
           tb.nguoi_tao,
           (SELECT COUNT(*)::int FROM thong_bao_nhan n WHERE n.thong_bao_id = tb.id) AS so_nguoi_nhan,
           (SELECT COUNT(*)::int FROM thong_bao_nhan n WHERE n.thong_bao_id = tb.id AND n.da_doc) AS so_da_doc
    FROM thong_bao tb
    ORDER BY tb.created_at DESC
    LIMIT $1
    `,
    [lim]
  );
  return r.rows;
};
