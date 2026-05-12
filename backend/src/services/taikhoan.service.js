import * as TaiKhoanModel from "../models/taikhoan.model.js";
import * as BenhNhanModel from "../models/benhnhan.model.js";
import * as NhanVienModel from "../models/nhanvien.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


const JWT_SECRET = "your_super_secret_key"; // Nên để trong file .env

/**
 * Thông tin user trả về sau đăng nhập: hoten hiển thị + (với client) dữ liệu benhnhan để form đặt lịch tự điền.
 * Chỉ một lần gọi getById cho bệnh nhân.
 */
async function buildPublicUserPayload(user) {
  const { matkhau: _, ...base } = user;
  const role = String(user.loaitaikhoan ?? "").trim().toLowerCase();
  const mid = user.manguoidung;
  const fallbackName = user.tentaikhoan || "";
  let out = { ...base, hoten: fallbackName };

  const id = Number(mid);
  if (!Number.isFinite(id)) return out;

  try {
    if (role === "client") {
      const bn = await BenhNhanModel.getById(id);
      if (bn) {
        const ht = bn.hoten != null ? String(bn.hoten).trim() : "";
        out = {
          ...out,
          hoten: ht || fallbackName,
          client_diachi: bn.diachi != null ? String(bn.diachi) : "",
          client_email: bn.email != null ? String(bn.email) : "",
          client_dienthoai: bn.dienthoai != null ? String(bn.dienthoai) : "",
          client_socccd: bn.socccd != null ? String(bn.socccd) : "",
          client_namsinh: bn.namsinh != null && bn.namsinh !== "" ? Number(bn.namsinh) : null,
        };
      }
      return out;
    }
    const nv = await NhanVienModel.getById(id);
    const name = nv?.hoten != null ? String(nv.hoten).trim() : "";
    if (name) out = { ...out, hoten: name };
    return out;
  } catch {
    return out;
  }
}

export const login = async (tentaikhoan, matkhau) => {
  // 1. Tìm tài khoản
  const user = await TaiKhoanModel.findByUsername(tentaikhoan);
  if (!user) {
    throw new Error("Tên đăng nhập không tồn tại");
  }

  // 2. Kiểm tra trạng thái khóa
  if (user.trangthai !== 'Hoạt động') {
    throw new Error("Tài khoản đang bị khóa");
  }

  // 3. So sánh mật khẩu 
  // (Nếu lúc tạo bạn đã dùng bcrypt.hash, thì dùng bcrypt.compare)
  // Nếu đang để pass text thuần (không khuyến khích): const isMatch = matkhau === user.matkhau;await bcrypt.compare(matkhau, user.matkhau)
  const isMatch = (matkhau === user.matkhau);
  
  if (!isMatch) {
    throw new Error("Mật khẩu không chính xác");
  }

  // 4. Tạo JWT Token
  const token = jwt.sign(
    { 
      id: user.mataikhoan, 
      username: user.tentaikhoan, 
      role: user.loaitaikhoan 
    },
    JWT_SECRET,
    { expiresIn: "1d" } // Token hết hạn sau 1 ngày
  );

  const userOut = await buildPublicUserPayload(user);
  return { token, user: userOut };
};



export const getAllAccounts = async () => await TaiKhoanModel.getAll();

export const deleteAccount = async (id) => await TaiKhoanModel.softDelete(id);

export const handleToggleStatus = async (id, currentStatus, actorId) => {
  const tid = Number(id);
  const aid = actorId != null && actorId !== "" ? Number(actorId) : NaN;
  if (Number.isFinite(tid) && Number.isFinite(aid) && tid === aid) {
    throw new Error("Không thể khóa hoặc mở khóa tài khoản của chính bạn.");
  }
  return await TaiKhoanModel.toggleStatus(id, currentStatus);
};

export const handleChangeRole = async (id, newRole) => 
  await TaiKhoanModel.updateRole(id, newRole);

// Hàm này sẽ được gọi từ BenhNhanService sau khi tạo bệnh nhân thành công
export const autoCreatePatientAccount = async (patientData) => 
  await TaiKhoanModel.createAccountForPatient(patientData);

export const createAccount = async (accountData) => {
  // 1. Kiểm tra trùng tên đăng nhập
  const existingUser = await TaiKhoanModel.findByUsername(accountData.tentaikhoan);
  if (existingUser) {
    throw new Error("Tên đăng nhập này đã tồn tại trong hệ thống");
  }

  // 2. Gọi model để tạo
  const newAccount = await TaiKhoanModel.create(accountData);
  if (!newAccount) {
    throw new Error("Không thể tạo tài khoản, vui lòng thử lại sau");
  }

  return newAccount;
};