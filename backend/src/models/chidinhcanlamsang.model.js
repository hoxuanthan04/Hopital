import pool from "../config/db.js";

export const listByMahosokham = async (mahosokham) => {
  const result = await pool.query(
    `
    SELECT c.machidinh,
           c.mahosokham,
           c.madichvu,
           c.bacsichidinh,
           c.ngaychidinh::text AS ngaychidinh,
           c.giochidinh,
           c.trangthai,
           c.ketquahinhanh,
           c.dicom_url,
           c.dicom_public_id,
           c.dicom_tenfile,
           c.ngaythuchien,
           c.maphong_thuchien,
           p.tenphong AS tenphong_thuchien,
           p.chucnang AS chucnang_thuchien,
           cl.tendichvu,
           cl.loaidichvu,
           cl.gia
    FROM chidinhcanlamsang c
    JOIN canlamsang cl ON c.madichvu = cl.madichvu
    LEFT JOIN phongkham p ON c.maphong_thuchien = p.maphong
    WHERE c.mahosokham = $1
    ORDER BY c.machidinh
    `,
    [mahosokham]
  );
  return result.rows;
};

/** Danh sách chỉ định đang chờ / đang thực hiện ở một phòng cụ thể (FIFO). */
export const listPendingByPhong = async (maphong) => {
  const result = await pool.query(
    `
    SELECT c.machidinh,
           c.mahosokham,
           c.madichvu,
           c.bacsichidinh,
           c.trangthai,
           c.ketquahinhanh,
           c.dicom_url,
           c.dicom_public_id,
           c.dicom_tenfile,
           c.ngaythuchien,
           c.maphong_thuchien,
           cl.tendichvu,
           cl.loaidichvu,
           cl.gia,
           h.maluotkham,
           h.mabenhnhan,
           bn.hoten,
           bn.namsinh,
           bn.gioitinh,
           lk.ngaykham,
           lk.lydokham,
           ROW_NUMBER() OVER (
             ORDER BY
               CASE WHEN TRIM(COALESCE(c.trangthai, '')) = 'Đang thực hiện' THEN 0 ELSE 1 END,
               c.machidinh ASC
           )::int AS stt_trong_phong
    FROM chidinhcanlamsang c
    JOIN canlamsang cl ON c.madichvu = cl.madichvu
    JOIN hosokhambenh h ON c.mahosokham = h.mahosokham
    LEFT JOIN benhnhan bn ON h.mabenhnhan = bn.mabenhnhan
    LEFT JOIN luotkham lk ON h.maluotkham = lk.maluotkham
    WHERE c.maphong_thuchien = $1
      AND TRIM(COALESCE(c.trangthai, '')) NOT IN ('Đã hoàn thành', 'Đã hủy')
    ORDER BY
      CASE WHEN TRIM(COALESCE(c.trangthai, '')) = 'Đang thực hiện' THEN 0 ELSE 1 END,
      c.machidinh ASC
    `,
    [maphong]
  );
  return result.rows;
};

export const getById = async (machidinh) => {
  const result = await pool.query(
    `
    SELECT c.*,
           cl.tendichvu,
           cl.loaidichvu,
           p.tenphong AS tenphong_thuchien
    FROM chidinhcanlamsang c
    JOIN canlamsang cl ON c.madichvu = cl.madichvu
    LEFT JOIN phongkham p ON c.maphong_thuchien = p.maphong
    WHERE c.machidinh = $1
    `,
    [machidinh]
  );
  return result.rows[0];
};

export const create = async (data) => {
  const result = await pool.query(
    `
    INSERT INTO chidinhcanlamsang
      (mahosokham, madichvu, bacsichidinh, ngaychidinh, giochidinh, trangthai, maphong_thuchien)
    VALUES ($1, $2, $3, COALESCE($4::date, CURRENT_DATE), $5, COALESCE($6, 'Chờ thực hiện'), $7)
    RETURNING *
    `,
    [
      data.mahosokham,
      data.madichvu,
      data.bacsichidinh ?? null,
      data.ngaychidinh ?? null,
      data.giochidinh ?? null,
      data.trangthai ?? null,
      data.maphong_thuchien ?? null,
    ]
  );
  return result.rows[0];
};

export const updateTrangThai = async (machidinh, trangthai) => {
  const result = await pool.query(
    `UPDATE chidinhcanlamsang SET trangthai = $2 WHERE machidinh = $1 RETURNING *`,
    [machidinh, trangthai]
  );
  return result.rows[0];
};

export const updateKetQua = async (machidinh, data) => {
  const result = await pool.query(
    `
    UPDATE chidinhcanlamsang SET
      ketquahinhanh = $2,
      dicom_url = $3,
      dicom_public_id = $4,
      dicom_tenfile = $5,
      ngaythuchien = COALESCE(ngaythuchien, NOW()),
      trangthai = 'Đã hoàn thành'
    WHERE machidinh = $1
    RETURNING *
    `,
    [
      machidinh,
      data.ketquahinhanh ?? null,
      data.dicom_url ?? null,
      data.dicom_public_id ?? null,
      data.dicom_tenfile ?? null,
    ]
  );
  return result.rows[0];
};

export const remove = async (machidinh) => {
  const result = await pool.query(
    `DELETE FROM chidinhcanlamsang WHERE machidinh = $1 RETURNING *`,
    [machidinh]
  );
  return result.rows[0];
};

/** Đã có chỉ định cùng dịch vụ CLS (madichvu) trên hồ sơ này? */
export const existsMahosokhamMadichvu = async (mahosokham, madichvu) => {
  const result = await pool.query(
    `SELECT 1 FROM chidinhcanlamsang WHERE mahosokham = $1 AND madichvu = $2 LIMIT 1`,
    [mahosokham, madichvu]
  );
  return result.rows.length > 0;
};

/** Trả về true nếu phòng đang có chỉ định khác ở trạng thái 'Đang thực hiện'. */
export const findOtherDangThucHienInPhong = async (maphong, excludeMachidinh) => {
  const pid = Number(maphong);
  const exclude = Number(excludeMachidinh);
  if (!Number.isFinite(pid) || !Number.isFinite(exclude)) return null;
  const result = await pool.query(
    `
    SELECT c.machidinh
    FROM chidinhcanlamsang c
    WHERE c.maphong_thuchien = $1
      AND c.machidinh <> $2
      AND TRIM(COALESCE(c.trangthai, '')) = 'Đang thực hiện'
    LIMIT 1
    `,
    [pid, exclude]
  );
  return result.rows[0] ?? null;
};
