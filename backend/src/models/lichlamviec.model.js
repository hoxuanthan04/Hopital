import pool from "../config/db.js";

const selectJoin = `
  SELECT l.id,
         l.manhanvien,
         l.maphong,
         l.calam,
         l.ngay::text AS ngay,
         l.ghichu,
         nv.hoten AS tennhanvien,
         pk.tenphong
  FROM lichlamviec l
  LEFT JOIN nhanvien nv ON l.manhanvien = nv.manhanvien
  LEFT JOIN phongkham pk ON l.maphong = pk.maphong
`;

export const getByNgay = async (ngay) => {
  const result = await pool.query(
    `${selectJoin}
     WHERE l.ngay = $1::date
     ORDER BY l.calam NULLS LAST, nv.hoten NULLS LAST, l.id`,
    [ngay]
  );
  return result.rows;
};

/** Lịch của một nhân viên trong khoảng ngày [tungay, denngay] (inclusive). */
export const getByNhanVienBetween = async (manhanvien, tungay, denngay) => {
  const result = await pool.query(
    `${selectJoin}
     WHERE l.manhanvien = $1
       AND l.ngay >= $2::date
       AND l.ngay <= $3::date
     ORDER BY l.ngay ASC, l.calam NULLS LAST, l.id`,
    [manhanvien, tungay, denngay]
  );
  return result.rows;
};

export const getById = async (id) => {
  const result = await pool.query(`${selectJoin} WHERE l.id = $1`, [id]);
  return result.rows[0];
};

export const create = async (data) => {
  const query = `
    INSERT INTO lichlamviec (manhanvien, maphong, calam, ngay, ghichu)
    VALUES ($1, $2, $3, $4::date, $5)
    RETURNING *
  `;
  const values = [
    data.manhanvien,
    data.maphong,
    data.calam,
    data.ngay,
    data.ghichu ?? null,
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const update = async (id, data) => {
  const query = `
    UPDATE lichlamviec SET
      manhanvien = $1,
      maphong = $2,
      calam = $3,
      ngay = $4::date,
      ghichu = $5
    WHERE id = $6
    RETURNING *
  `;
  const values = [
    data.manhanvien,
    data.maphong,
    data.calam,
    data.ngay,
    data.ghichu ?? null,
    id,
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const remove = async (id) => {
  const result = await pool.query(
    "DELETE FROM lichlamviec WHERE id = $1 RETURNING *",
    [id]
  );
  return result.rows[0];
};

/** Đã có dòng khác cùng phòng + ca + ngày? (excludeId: bỏ qua khi cập nhật) */
export const existsRoomCaNgay = async (maphong, calam, ngay, excludeId = null) => {
  const base = `SELECT 1 FROM lichlamviec WHERE maphong = $1 AND calam = $2 AND ngay = $3::date`;
  const params =
    excludeId == null
      ? [maphong, calam, ngay]
      : [maphong, calam, ngay, excludeId];
  const sql =
    excludeId == null
      ? `${base} LIMIT 1`
      : `${base} AND id <> $4 LIMIT 1`;
  const result = await pool.query(sql, params);
  return result.rows.length > 0;
};

/** Đã có dòng khác cùng nhân viên + ca + ngày? */
export const existsNhanVienCaNgay = async (manhanvien, calam, ngay, excludeId = null) => {
  const base = `SELECT 1 FROM lichlamviec WHERE manhanvien = $1 AND calam = $2 AND ngay = $3::date`;
  const params =
    excludeId == null
      ? [manhanvien, calam, ngay]
      : [manhanvien, calam, ngay, excludeId];
  const sql =
    excludeId == null
      ? `${base} LIMIT 1`
      : `${base} AND id <> $4 LIMIT 1`;
  const result = await pool.query(sql, params);
  return result.rows.length > 0;
};
