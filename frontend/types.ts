
export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  phoneNumber: string;
  email: string;
  avatar?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  degree: string;
  experience: string;
  phoneNumber: string;
  email: string;
  avatar?: string;
  status: 'Available' | 'On Leave' | 'Busy';
}

export interface Appointment {
  id: string;
  time: string;
  date: string;
  patientName: string;
  patientAge?: number;
  doctorName: string;
  status: 'Paid' | 'UnPaid';
  avatar?: string;
}

export interface Medicine {
  id: string;
  name: string;
  sku: string;
  type: string;
  price: number;
  inStock: number;
  stockUnit: string;
  expiryDate: string;
  manufacturer: string;
}

export interface EducationContent {
  id: string;
  title: string;
  author: string;
  image: string;
}

export interface Department {
  id: string;
  name: string;
  headOfDepartment: string; // Trưởng khoa
  doctorCount: number;
  patientCount: number;
  status: 'Active' | 'Under Maintenance' | 'Full';
  location: string;
  icon?: string;
}

export interface Room {
  maphong: string;       // Primary Key (Serial)
  tenphong: string;      // Tên phòng
  khoa: string;          // Khoa (Cardiology, Pediatrics, etc.)
  chucnang: string;      // Chức năng (Khám bệnh, Siêu âm, v.v.)
  tang: string;          // Tầng
  khu: string;           // Khu (Khu A, Khu B)
  trangthai: string;     // Trạng thái (Đang hoạt động, Trống, Đang sửa chữa)
  mamayphong: string;    // Mã máy phòng
}

export interface Account {
  mataikhoan: number;      // Serial
  tentaikhoan: string;     // Username
  matkhau: string;         // Password (nên ẩn hoặc hash)
  manguoidung: number;     // FK liên kết với bảng người dùng/nhân viên
  trangthai: string;       // Hoạt động, Tạm khóa
  loaitaikhoan: string;    // Admin, Doctor, Staff, v.v.
  isdelete: boolean;       // Soft delete
}

export interface Schedule {
  id: number;
  manhanvien: number;  // FK
  maphong: number;      // FK
  calam: string;       // Sáng, Chiều, Tối, Ca gãy
  ngay: string;        // Date string
  ghichu: string;
  // Thêm thông tin mở rộng để hiển thị (thường join từ bảng nhân viên/phòng)
  tennhanvien?: string;
  tenphong?: string;
}