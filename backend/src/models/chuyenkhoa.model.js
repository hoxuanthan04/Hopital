import pool from "../config/db.js";

export const getAll = async () => {
  const result = await pool.query(
    "SELECT * FROM chuyenkhoa ORDER BY machuyenkhoa"
  );
  return result.rows;
};

export const getById = async (id) => {
  const result = await pool.query(
    "SELECT * FROM chuyenkhoa WHERE machuyenkhoa = $1",
    [id]
  );
  return result.rows[0];
};

export const create = async (data) => {
  const query = `
    INSERT INTO chuyenkhoa (tenchuyenkhoa, mota, trangthai)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  const values = [
    data.tenchuyenkhoa,
    data.mota,
    data.trangthai !== undefined ? data.trangthai : true
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const update = async (id, data) => {
  const query = `
    UPDATE chuyenkhoa SET
    tenchuyenkhoa = $1,
    mota = $2,
    trangthai = $3
    WHERE machuyenkhoa = $4
    RETURNING *
  `;
  const values = [data.tenchuyenkhoa, data.mota, data.trangthai, id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const remove = async (id) => {
  const result = await pool.query(
    "DELETE FROM chuyenkhoa WHERE machuyenkhoa = $1 RETURNING *",
    [id]
  );
  return result.rows[0];
};