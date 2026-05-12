import pool from "../config/db.js";

// Lấy toàn bộ danh mục vật tư
export const getAll = async () => {
  const result = await pool.query(
    "SELECT * FROM danhmucvattu ORDER BY mavattu DESC"
  );
  return result.rows;
};

export const listByLoaiVattu = async (loaiPattern) => {
  const result = await pool.query(
    `
    SELECT * FROM danhmucvattu
    WHERE loaivattu IS NOT NULL AND loaivattu ILIKE $1
    ORDER BY tenvattu
    `,
    [loaiPattern]
  );
  return result.rows;
};

// Lấy chi tiết một vật tư
export const getById = async (id) => {
  const result = await pool.query(
    "SELECT * FROM danhmucvattu WHERE mavattu = $1",
    [id]
  );
  return result.rows[0];
};

// Thêm mới vật tư
export const create = async (data) => {
  const query = `
    INSERT INTO danhmucvattu 
    (tenvattu, loaivattu, nhasanxuat, hangsanxuat, thanhphan, huongdansudung, congdung, doituongsudung, chophepbanweb, giaban)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `;
  const values = [
    data.tenvattu,
    data.loaivattu,
    data.nhasanxuat,
    data.hangsanxuat,
    data.thanhphan,
    data.huongdansudung,
    data.congdung,
    data.doituongsudung,
    data.chophepbanweb,
    data.giaban,
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Cập nhật vật tư
export const update = async (id, data) => {
  const query = `
    UPDATE danhmucvattu SET
    tenvattu=$1, loaivattu=$2, nhasanxuat=$3, hangsanxuat=$4, thanhphan=$5, 
    huongdansudung=$6, congdung=$7, doituongsudung=$8, chophepbanweb=$9, giaban=$10
    WHERE mavattu=$11
    RETURNING *
  `;
  const values = [
    data.tenvattu,
    data.loaivattu,
    data.nhasanxuat,
    data.hangsanxuat,
    data.thanhphan,
    data.huongdansudung,
    data.congdung,
    data.doituongsudung,
    data.chophepbanweb,
    data.giaban,
    id,
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Xóa vật tư
export const remove = async (id) => {
  const result = await pool.query(
    "DELETE FROM danhmucvattu WHERE mavattu=$1 RETURNING *",
    [id]
  );
  return result.rows[0];
};