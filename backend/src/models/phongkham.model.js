import pool from "../config/db.js";

const SELECT_PHONG_LIST = `
  SELECT p.maphong,
         p.tenphong,
         p.chucnang,
         p.tang,
         p.khu,
         p.trangthai,
         p.mamayphong,
         p.machuyenkhoa,
         ck.tenchuyenkhoa
  FROM phongkham p
  LEFT JOIN chuyenkhoa ck ON p.machuyenkhoa = ck.machuyenkhoa
`;

function normalizeMachuyenkhoa(v) {
  if (v === "" || v === undefined || v === null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export const getAll = async () => {
  const result = await pool.query(`${SELECT_PHONG_LIST} ORDER BY p.maphong`);
  return result.rows;
};

export const getById = async (id) => {
  const result = await pool.query(`${SELECT_PHONG_LIST} WHERE p.maphong = $1`, [id]);
  return result.rows[0];
};

/** Tra phòng theo mã máy (cột mamayphong), không phân biệt hoa thường, bỏ khoảng trắng đầu cuối */
export const getByMamayPhong = async (code) => {
  const result = await pool.query(
    `${SELECT_PHONG_LIST}
    WHERE p.mamayphong IS NOT NULL
      AND TRIM(LOWER(p.mamayphong)) = TRIM(LOWER($1))
    LIMIT 1`,
    [code]
  );
  return result.rows[0];
};

export const create = async (data) => {
  const query = `
    INSERT INTO phongkham
    (tenphong, chucnang, tang, khu, trangthai, mamayphong, machuyenkhoa)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING maphong
  `;

  const values = [
    data.tenphong,
    data.chucnang,
    data.tang,
    data.khu,
    data.trangthai,
    data.mamayphong,
    normalizeMachuyenkhoa(data.machuyenkhoa),
  ];

  const result = await pool.query(query, values);
  const id = result.rows[0]?.maphong;
  return id != null ? await getById(id) : null;
};

export const update = async (id, data) => {
  const query = `
    UPDATE phongkham SET
    tenphong=$1,
    chucnang=$2,
    tang=$3,
    khu=$4,
    trangthai=$5,
    mamayphong=$6,
    machuyenkhoa=$7
    WHERE maphong=$8
    RETURNING maphong
  `;

  const values = [
    data.tenphong,
    data.chucnang,
    data.tang,
    data.khu,
    data.trangthai,
    data.mamayphong,
    normalizeMachuyenkhoa(data.machuyenkhoa),
    id,
  ];

  const result = await pool.query(query, values);
  const outId = result.rows[0]?.maphong;
  return outId != null ? await getById(outId) : null;
};

export const remove = async (id) => {
  const result = await pool.query(
    "DELETE FROM phongkham WHERE maphong=$1 RETURNING *",
    [id]
  );
  return result.rows[0];
};
