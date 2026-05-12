import pool from "../config/db.js";

export const getAll = async () => {
  const result = await pool.query(
    "SELECT * FROM nhanvien ORDER BY manhanvien"
  );
  return result.rows;
};

export const getById = async (id) => {
  const result = await pool.query(
    "SELECT * FROM nhanvien WHERE manhanvien = $1",
    [id]
  );
  return result.rows[0];
};

export const create = async (data) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN'); 

    const queryNhanVien = `
      INSERT INTO nhanvien
      (anh, hoten, ngaysinh, gioitinh, socccd, sdt, email, chucvu, hocham, chuyenkhoa)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const valuesNhanVien = [
      data.anh,
      data.hoten,
      data.ngaysinh,
      data.gioitinh,
      data.socccd,
      data.sdt,
      data.email,
      data.chucvu,
      data.hocham,
      data.chuyenkhoa
    ];

    const resNhanVien = await client.query(queryNhanVien, valuesNhanVien);
    const newNhanVien = resNhanVien.rows[0];

    const queryTaiKhoan = `
      INSERT INTO taikhoan
      (tentaikhoan, matkhau, manguoidung, trangthai, loaitaikhoan, isdelete)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;

    const valuesTaiKhoan = [
      newNhanVien.socccd,     
      newNhanVien.sdt,             
      newNhanVien.manhanvien, 
      'Hoạt động',        
      'Staff',                
      false                   
    ];

    await client.query(queryTaiKhoan, valuesTaiKhoan);

    await client.query('COMMIT'); 
    return newNhanVien;

  } catch (error) {
    await client.query('ROLLBACK'); 
    throw error;
  } finally {
    client.release(); // Giải phóng client trả về pool
  }
};

export const update = async (id, data) => {
  const query = `
    UPDATE nhanvien SET
    anh=$1,
    hoten=$2,
    ngaysinh=$3,
    gioitinh=$4,
    socccd=$5,
    sdt=$6,
    email=$7,
    chucvu=$8,
    hocham=$9,
    chuyenkhoa=$10
    WHERE manhanvien=$11
    RETURNING *
  `;

  const values = [
    data.anh,
    data.hoten,
    data.ngaysinh,
    data.gioitinh,
    data.socccd,
    data.sdt,
    data.email,
    data.chucvu,
    data.hocham,
    data.chuyenkhoa,
    id
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

export const remove = async (id) => {
  const result = await pool.query(
    "DELETE FROM nhanvien WHERE manhanvien=$1 RETURNING *",
    [id]
  );
  return result.rows[0];
};


export const getWithoutAccount = async () => {
  const query = `
    SELECT nv.* FROM nhanvien nv
    LEFT JOIN taikhoan tk ON nv.manhanvien = tk.manguoidung
    WHERE tk.mataikhoan IS NULL 
  `;
  const result = await pool.query(query);
  return result.rows;
};