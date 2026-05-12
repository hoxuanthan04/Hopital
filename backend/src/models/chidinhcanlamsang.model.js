import pool from "../config/db.js";

export const listByMahosokham = async (mahosokham) => {
  const result = await pool.query(
    `
    SELECT c.machidinh,
           c.mahosokham,
           c.madichvu,
           c.bacsichidinh,
           c.ngaychidinh::text AS ngaychidinh,
           c.giochidinh,
           c.trangthai,
           cl.tendichvu,
           cl.loaidichvu,
           cl.gia
    FROM chidinhcanlamsang c
    JOIN canlamsang cl ON c.madichvu = cl.madichvu
    WHERE c.mahosokham = $1
    ORDER BY c.machidinh
    `,
    [mahosokham]
  );
  return result.rows;
};

export const getById = async (machidinh) => {
  const result = await pool.query(
    `
    SELECT c.*, cl.tendichvu, cl.loaidichvu
    FROM chidinhcanlamsang c
    JOIN canlamsang cl ON c.madichvu = cl.madichvu
    WHERE c.machidinh = $1
    `,
    [machidinh]
  );
  return result.rows[0];
};

export const create = async (data) => {
  const result = await pool.query(
    `
    INSERT INTO chidinhcanlamsang (mahosokham, madichvu, bacsichidinh, ngaychidinh, giochidinh, trangthai)
    VALUES ($1, $2, $3, COALESCE($4::date, CURRENT_DATE), $5, COALESCE($6, 'Chờ thực hiện'))
    RETURNING *
    `,
    [
      data.mahosokham,
      data.madichvu,
      data.bacsichidinh ?? null,
      data.ngaychidinh ?? null,
      data.giochidinh ?? null,
      data.trangthai ?? null,
    ]
  );
  return result.rows[0];
};

export const updateTrangThai = async (machidinh, trangthai) => {
  const result = await pool.query(
    `UPDATE chidinhcanlamsang SET trangthai = $2 WHERE machidinh = $1 RETURNING *`,
    [machidinh, trangthai]
  );
  return result.rows[0];
};

export const remove = async (machidinh) => {
  const result = await pool.query(
    `DELETE FROM chidinhcanlamsang WHERE machidinh = $1 RETURNING *`,
    [machidinh]
  );
  return result.rows[0];
};

/** Đã có chỉ định cùng dịch vụ CLS (madichvu) trên hồ sơ này? */
export const existsMahosokhamMadichvu = async (mahosokham, madichvu) => {
  const result = await pool.query(
    `SELECT 1 FROM chidinhcanlamsang WHERE mahosokham = $1 AND madichvu = $2 LIMIT 1`,
    [mahosokham, madichvu]
  );
  return result.rows.length > 0;
};
