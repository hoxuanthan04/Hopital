import pool from "../config/db.js";

const selectList = `
  SELECT h.*, bn.hoten, bn.socccd
  FROM hoadonthanhtoan h
  LEFT JOIN benhnhan bn ON h.mabenhnhan = bn.mabenhnhan
`;

export const getAll = async () => {
  const result = await pool.query(`${selectList} ORDER BY h.mahoadon DESC`);
  return result.rows;
};

export const getById = async (id) => {
  const result = await pool.query(
    `${selectList} WHERE h.mahoadon = $1`,
    [id]
  );
  return result.rows[0];
};

export const getChiTietDichVu = async (mahoadon) => {
  const result = await pool.query(
    `
    SELECT d.id, d.mahoadon, d.madichvu, d.soluong, d.dongia, d.thanhtien,
           cl.tendichvu
    FROM hoadon_dichvu d
    LEFT JOIN canlamsang cl ON d.madichvu = cl.madichvu
    WHERE d.mahoadon = $1
    ORDER BY d.id
  `,
    [mahoadon]
  );
  return result.rows;
};

export const create = async (data) => {
  const query = `
    INSERT INTO hoadonthanhtoan (
      mabenhnhan, danhsachdichvu, sotienbaohiemchitra, thuctracuabenhnhan, tongtien
    ) VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const values = [
    data.mabenhnhan,
    data.danhsachdichvu ?? "",
    data.sotienbaohiemchitra ?? 0,
    data.thuctracuabenhnhan ?? 0,
    data.tongtien,
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const update = async (id, data) => {
  const query = `
    UPDATE hoadonthanhtoan SET
      mabenhnhan = $1,
      danhsachdichvu = $2,
      sotienbaohiemchitra = $3,
      thuctracuabenhnhan = $4,
      tongtien = $5
    WHERE mahoadon = $6
    RETURNING *
  `;
  const values = [
    data.mabenhnhan,
    data.danhsachdichvu ?? "",
    data.sotienbaohiemchitra ?? 0,
    data.thuctracuabenhnhan ?? 0,
    data.tongtien,
    id,
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const remove = async (id) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM hoadon_dichvu WHERE mahoadon = $1", [id]);
    const r = await client.query(
      "DELETE FROM hoadonthanhtoan WHERE mahoadon = $1 RETURNING *",
      [id]
    );
    await client.query("COMMIT");
    return r.rows[0];
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
};

/** Tìm hóa đơn đã gắn marker hồ sơ [HSK:n] ở đầu mô tả. */
export const findMahoadonByHoSoMarker = async (mahosokham) => {
  const marker = `[HSK:${Number(mahosokham)}]`;
  const result = await pool.query(
    `SELECT mahoadon FROM hoadonthanhtoan
     WHERE danhsachdichvu LIKE $1
     ORDER BY mahoadon DESC LIMIT 1`,
    [`${marker}%`]
  );
  return result.rows[0]?.mahoadon ?? null;
};
