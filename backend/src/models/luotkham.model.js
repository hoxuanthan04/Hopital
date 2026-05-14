import pool from "../config/db.js";

// Lấy tất cả lượt khám kèm thông tin bệnh nhân
export const getAll = async () => {
  const query = `
    SELECT lk.*, bn.hoten, bn.gioitinh, bn.namsinh, bn.socccd 
    FROM luotkham lk
    JOIN benhnhan bn ON lk.mabenhnhan = bn.mabenhnhan
    ORDER BY lk.maluotkham DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

// Lấy chi tiết 1 lượt khám kèm thông tin bệnh nhân
export const getById = async (id) => {
  const query = `
    SELECT lk.*, bn.hoten, bn.gioitinh, bn.namsinh, bn.socccd, bn.diachi, bn.dienthoai
    FROM luotkham lk
    JOIN benhnhan bn ON lk.mabenhnhan = bn.mabenhnhan
    WHERE lk.maluotkham = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// Lấy danh sách lượt khám theo phòng (PatientQueue: bỏ hoàn thành / đã hủy; FIFO: ngày khám + mã lượt; Đang khám lên trước)
export const getByPhong = async (maphong) => {
  const query = `
    SELECT lk.*, bn.hoten, bn.gioitinh, bn.namsinh,
      ROW_NUMBER() OVER (
        ORDER BY
          CASE WHEN TRIM(COALESCE(lk.trangthai, '')) = 'Đang khám' THEN 0 ELSE 1 END,
          lk.ngaykham ASC NULLS LAST,
          lk.maluotkham ASC
      )::int AS stt_trong_phong
    FROM luotkham lk
    JOIN benhnhan bn ON lk.mabenhnhan = bn.mabenhnhan
    WHERE lk.maphong = $1
      AND TRIM(COALESCE(lk.trangthai, '')) NOT IN ('Hoàn thành', 'Đã hủy')
    ORDER BY
      CASE WHEN TRIM(COALESCE(lk.trangthai, '')) = 'Đang khám' THEN 0 ELSE 1 END,
      lk.ngaykham ASC NULLS LAST,
      lk.maluotkham ASC
  `;
  const result = await pool.query(query, [maphong]);
  return result.rows;
};

/** Lượt khám chưa kết thúc của bệnh nhân (trừ Hoàn thành / Đã hủy). */
export const findIncompleteVisitByMabenhnhan = async (mabenhnhan) => {
  const result = await pool.query(
    `
    SELECT maluotkham, trangthai
    FROM luotkham
    WHERE mabenhnhan = $1
      AND TRIM(COALESCE(trangthai, '')) NOT IN ('Hoàn thành', 'Đã hủy')
    ORDER BY maluotkham DESC
    LIMIT 1
    `,
    [mabenhnhan]
  );
  return result.rows[0];
};

/** Lượt khám khác trong cùng phòng đang «Đang khám» (trừ maluotkham đang xử lý). */
export const findOtherDangKhamInPhong = async (maphong, excludeMaluotkham) => {
  const pid = Number(maphong);
  const exclude = Number(excludeMaluotkham);
  if (!Number.isFinite(pid) || !Number.isFinite(exclude)) return null;
  const result = await pool.query(
    `
    SELECT lk.maluotkham, bn.hoten
    FROM luotkham lk
    JOIN benhnhan bn ON lk.mabenhnhan = bn.mabenhnhan
    WHERE lk.maphong = $1
      AND lk.maluotkham <> $2
      AND TRIM(COALESCE(lk.trangthai, '')) = 'Đang khám'
    LIMIT 1
    `,
    [pid, exclude]
  );
  return result.rows[0] ?? null;
};

export const create = async (data) => {
  const query = `
    INSERT INTO luotkham (mabenhnhan, ngaykham, lydokham, loaihinhkham, trangthai, maphong)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  const values = [data.mabenhnhan, data.ngaykham, data.lydokham, data.loaihinhkham, data.trangthai, data.maphong];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const createWithNewPatient = async (data) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const patientQuery = `
      INSERT INTO benhnhan (hoten, gioitinh, namsinh, socccd, mabhyt, quoctich, dantoc, diachi, email, dienthoai, nghenghiep)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING mabenhnhan
    `;
    const patientValues = [
      data.hoten, data.gioitinh, data.namsinh, data.socccd, data.mabhyt,
      data.quoctich, data.dantoc, data.diachi, data.email, data.dienthoai, data.nghenghiep
    ];
    const patientRes = await client.query(patientQuery, patientValues);
    const newMaBN = patientRes.rows[0].mabenhnhan;

    const visitQuery = `
      INSERT INTO luotkham (mabenhnhan, ngaykham, lydokham, loaihinhkham, trangthai, maphong)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const visitRes = await client.query(visitQuery, [newMaBN, data.ngaykham, data.lydokham, data.loaihinhkham, data.trangthai, data.maphong]);
    await client.query('COMMIT');
    return { ...visitRes.rows[0], hoten: data.hoten, benhnhan_moi: true };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const update = async (id, data) => {
  const query = `UPDATE luotkham SET mabenhnhan=$1, ngaykham=$2, lydokham=$3, loaihinhkham=$4, trangthai=$5, maphong=$6 WHERE maluotkham=$7 RETURNING *`;
  const values = [data.mabenhnhan, data.ngaykham, data.lydokham, data.loaihinhkham, data.trangthai, data.maphong, id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const remove = async (id) => {
  const result = await pool.query("DELETE FROM luotkham WHERE maluotkham=$1 RETURNING *", [id]);
  return result.rows[0];
};