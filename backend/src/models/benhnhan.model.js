import pool from "../config/db.js";

export const getAll = async () => {
  const result = await pool.query(
    "SELECT * FROM benhnhan ORDER BY mabenhnhan"
  );
  return result.rows;
};

export const getById = async (id) => {
  const result = await pool.query(
    "SELECT * FROM benhnhan WHERE mabenhnhan = $1",
    [id]
  );
  return result.rows[0];
};

export const findBySocccd = async (socccd) => {
  const result = await pool.query(
    "SELECT mabenhnhan FROM benhnhan WHERE TRIM(COALESCE(socccd, '')) = TRIM($1) LIMIT 1",
    [socccd]
  );
  return result.rows[0];
};

/** Trùng số điện thoại với bệnh nhân khác (excludeMabenhnhan: bỏ qua chính BN đó khi cập nhật). */
export const findByDienthoai = async (dienthoai, excludeMabenhnhan = null) => {
  let sql =
    "SELECT mabenhnhan, socccd, hoten FROM benhnhan WHERE TRIM(COALESCE(dienthoai, '')) = TRIM($1)";
  const params = [dienthoai];
  if (excludeMabenhnhan != null && excludeMabenhnhan !== "" && Number.isFinite(Number(excludeMabenhnhan))) {
    sql += " AND mabenhnhan <> $2";
    params.push(Number(excludeMabenhnhan));
  }
  sql += " LIMIT 1";
  const result = await pool.query(sql, params);
  return result.rows[0];
};

export const create = async (data) => {
  const query = `
    INSERT INTO benhnhan
    (hoten, gioitinh, namsinh, socccd, mabhyt, quoctich, dantoc, diachi, email, dienthoai, nghenghiep)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    RETURNING *
  `;

  const values = [
    data.hoten,
    data.gioitinh,
    data.namsinh,
    data.socccd,
    data.mabhyt,
    data.quoctich,
    data.dantoc,
    data.diachi,
    data.email,
    data.dienthoai,
    data.nghenghiep,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

export const update = async (id, data) => {
  const query = `
    UPDATE benhnhan SET
    hoten=$1,
    gioitinh=$2,
    namsinh=$3,
    socccd=$4,
    mabhyt=$5,
    quoctich=$6,
    dantoc=$7,
    diachi=$8,
    email=$9,
    dienthoai=$10,
    nghenghiep=$11
    WHERE mabenhnhan=$12
    RETURNING *
  `;

  const values = [
    data.hoten,
    data.gioitinh,
    data.namsinh,
    data.socccd,
    data.mabhyt,
    data.quoctich,
    data.dantoc,
    data.diachi,
    data.email,
    data.dienthoai,
    data.nghenghiep,
    id,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

export const remove = async (id) => {
  const result = await pool.query(
    "DELETE FROM benhnhan WHERE mabenhnhan=$1 RETURNING *",
    [id]
  );
  return result.rows[0];
};