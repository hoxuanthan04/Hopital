import pool from "../config/db.js";

export const getAll = async () => {
  const result = await pool.query(
    "SELECT * FROM canlamsang ORDER BY madichvu"
  );
  return result.rows;
};

export const getById = async (id) => {
  const result = await pool.query(
    "SELECT * FROM canlamsang WHERE madichvu = $1",
    [id]
  );
  return result.rows[0];
};

export const create = async (data) => {
  const query = `
    INSERT INTO canlamsang 
    (tendichvu, loaidichvu, gia, mota, trangthai)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const values = [
    data.tendichvu,
    data.loaidichvu,
    data.gia,
    data.mota,
    data.trangthai || 'Đang hoạt động'
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const update = async (id, data) => {
  const query = `
    UPDATE canlamsang SET
    tendichvu = $1,
    loaidichvu = $2,
    gia = $3,
    mota = $4,
    trangthai = $5
    WHERE madichvu = $6
    RETURNING *
  `;
  const values = [
    data.tendichvu,
    data.loaidichvu,
    data.gia,
    data.mota,
    data.trangthai,
    id
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const remove = async (id) => {
  const result = await pool.query(
    "DELETE FROM canlamsang WHERE madichvu = $1 RETURNING *",
    [id]
  );
  return result.rows[0];
};