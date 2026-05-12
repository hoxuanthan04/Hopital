import pool from "../config/db.js";

export const getAll = async () => {
  const result = await pool.query(
    "SELECT * FROM dangkyhenkham ORDER BY ngaykham DESC, giokham DESC"
  );
  return result.rows;
};

export const getById = async (id) => {
  const result = await pool.query(
    "SELECT * FROM dangkyhenkham WHERE id = $1",
    [id]
  );
  return result.rows[0];
};

export const create = async (data) => {
  const query = `
    INSERT INTO dangkyhenkham
    (hoten, socccd, sodienthoai, namsinh, loaikham, lydokham, ngaykham, giokham, ngaydangky, trangthai)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `;

  const values = [
    data.hoten,
    data.socccd,
    data.sodienthoai,
    data.namsinh,
    data.loaikham,
    data.lydokham,
    data.ngaykham,
    data.giokham,
    data.ngaydangky || new Date(), // Mặc định là ngày hiện tại nếu không gửi lên
    data.trangthai || 'Chờ xác nhận'
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

export const update = async (id, data) => {
  const query = `
    UPDATE dangkyhenkham SET
    hoten=$1, socccd=$2, sodienthoai=$3, namsinh=$4, loaikham=$5, 
    lydokham=$6, ngaykham=$7, giokham=$8, ngaydangky=$9, trangthai=$10
    WHERE id=$11
    RETURNING *
  `;

  const values = [
    data.hoten, data.socccd, data.sodienthoai, data.namsinh, data.loaikham,
    data.lydokham, data.ngaykham, data.giokham, data.ngaydangky, data.trangthai,
    id
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

export const remove = async (id) => {
  const result = await pool.query(
    "DELETE FROM dangkyhenkham WHERE id=$1 RETURNING *",
    [id]
  );
  return result.rows[0];
};