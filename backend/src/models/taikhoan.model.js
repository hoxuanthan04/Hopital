import pool from "../config/db.js";

// Lấy danh sách tài khoản chưa bị xóa (isdelete = false)
export const getAll = async () => {
  const result = await pool.query(
    "SELECT mataikhoan, tentaikhoan, manguoidung, trangthai, loaitaikhoan FROM taikhoan WHERE isdelete = false ORDER BY mataikhoan DESC"
  );
  return result.rows;
};

// 1. Xóa mềm (Cập nhật isdelete = true)
export const softDelete = async (id) => {
  const result = await pool.query(
    "UPDATE taikhoan SET isdelete = true WHERE mataikhoan = $1 RETURNING *",
    [id]
  );
  return result.rows[0];
};

// 2. Function tạo tài khoản tự động (Dùng cho Bệnh nhân — loại client)
// Tên đăng nhập = số CCCD; mật khẩu = số điện thoại; trạng thái khớp đăng nhập (Hoạt động).
export const createAccountForPatient = async (patientData) => {
  const dienthoai = String(patientData.dienthoai ?? "").trim();
  const socccd = String(patientData.socccd ?? "").trim();
  const mabenhnhan = patientData.mabenhnhan;

  if (!socccd) {
    throw new Error("Thiếu số căn cước công dân để tạo tài khoản.");
  }
  if (!dienthoai) {
    throw new Error("Thiếu số điện thoại để tạo tài khoản.");
  }

  const tentaikhoan = socccd;
  const matkhau = dienthoai;
  const trangthai = "Hoạt động";
  const loaitaikhoan = "client";

  const query = `
    INSERT INTO taikhoan (tentaikhoan, matkhau, manguoidung, trangthai, loaitaikhoan, isdelete)
    VALUES ($1, $2, $3, $4, $5, false) RETURNING *`;

  const values = [tentaikhoan, matkhau, mabenhnhan, trangthai, loaitaikhoan];
  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (e) {
    if (e && e.code === "23505") {
      throw new Error("Tên đăng nhập (số CCCD) đã tồn tại trong hệ thống.");
    }
    throw e;
  }
};

// 3. Vô hiệu hóa/Mở khóa tài khoản
export const toggleStatus = async (id, currentStatus) => {
  // Tối ưu logic: Nếu là "Hoạt động" thì đổi thành "Bị khóa", ngược lại là "Hoạt động"
  const newStatus = currentStatus === "Hoạt động" ? "Bị khóa" : "Hoạt động";

  const query = "UPDATE taikhoan SET trangthai = $1 WHERE mataikhoan = $2 RETURNING *";
  const values = [newStatus, id];

  try {
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      throw new Error("Không tìm thấy tài khoản với ID này");
    }
    
    return result.rows[0];
  } catch (error) {
    console.error("Lỗi Model toggleStatus:", error);
    throw error;
  }
};

// 4. Thay đổi loại tài khoản
export const updateRole = async (id, newRole) => {
  const result = await pool.query(
    "UPDATE taikhoan SET loaitaikhoan = $1 WHERE mataikhoan = $2 RETURNING *",
    [newRole, id]
  );
  return result.rows[0];
};

export const create = async (data) => {
  const { tentaikhoan, matkhau, manguoidung, loaitaikhoan } = data;
  
  const query = `
    INSERT INTO taikhoan (tentaikhoan, matkhau, manguoidung, loaitaikhoan, trangthai, isdelete)
    VALUES ($1, $2, $3, $4, 'Hoạt động', false)
    RETURNING *;
  `;
  
  const values = [tentaikhoan, matkhau, manguoidung, loaitaikhoan];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Kiểm tra xem tên tài khoản đã tồn tại chưa
export const findByUsername = async (username) => {
  const query = "SELECT * FROM taikhoan WHERE tentaikhoan = $1 AND isdelete = false";
  const result = await pool.query(query, [username]);
  return result.rows[0];
};

export const findByMataikhoan = async (mataikhoan) => {
  const result = await pool.query(
    "SELECT * FROM taikhoan WHERE mataikhoan = $1 AND isdelete = false",
    [mataikhoan]
  );
  return result.rows[0];
};
