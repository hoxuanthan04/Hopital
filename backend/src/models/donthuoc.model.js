import pool from "../config/db.js";

export const create = async ({ bacsikedon, mabenhnhan }) => {
  const result = await pool.query(
    `
    INSERT INTO donthuoc (bacsikedon, ngaykedon, mabenhnhan)
    VALUES ($1, CURRENT_DATE, $2)
    RETURNING *
    `,
    [bacsikedon ?? null, mabenhnhan]
  );
  return result.rows[0];
};

export const insertChiTietVattu = async ({
  madonthuoc,
  mavattu,
  soluong,
  lieudung,
  cachdung,
}) => {
  const result = await pool.query(
    `
    INSERT INTO chitietdonthuoc (madonthuoc, mavattu, mathuoc, soluong, lieudung, cachdung)
    VALUES ($1, $2, NULL, $3, $4, $5)
    RETURNING *
    `,
    [
      madonthuoc,
      mavattu,
      Math.max(1, Number(soluong) || 1),
      lieudung != null ? String(lieudung).slice(0, 200) : null,
      cachdung != null ? String(cachdung).slice(0, 200) : null,
    ]
  );
  return result.rows[0];
};
