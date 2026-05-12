import pool from "../config/db.js";

export const getAll = async () => {
  const result = await pool.query(
    "SELECT * FROM hosokhambenh ORDER BY mahosokham DESC"
  );
  return result.rows;
};

export const getById = async (id) => {
  const result = await pool.query(
    "SELECT * FROM hosokhambenh WHERE mahosokham = $1",
    [id]
  );
  return result.rows[0];
};

export const getByMaluotkham = async (maluotkham) => {
  const result = await pool.query(
    "SELECT * FROM hosokhambenh WHERE maluotkham = $1 ORDER BY mahosokham DESC LIMIT 1",
    [maluotkham]
  );
  return result.rows[0];
};

/** Hồ sơ đã kết thúc khám / chờ thanh toán (hiển thị cho bệnh nhân). */
export const listHoanTatByMabenhnhan = async (mabenhnhan) => {
  const result = await pool.query(
    `
    SELECT h.*,
           nv.hoten AS bacsiphutrach_ten,
           lk.ngaykham::text AS ngaykham_luot
    FROM hosokhambenh h
    LEFT JOIN nhanvien nv ON h.bacsiphutrach = nv.manhanvien
    LEFT JOIN luotkham lk ON h.maluotkham = lk.maluotkham
    WHERE h.mabenhnhan = $1
      AND TRIM(COALESCE(h.trangthai, '')) IN ('Đã hoàn tất', 'Chờ thanh toán')
    ORDER BY h.mahosokham DESC
    `,
    [mabenhnhan]
  );
  return result.rows;
};

/** Chi tiết một hồ sơ thuộc đúng bệnh nhân (kèm chỉ định CLS, đơn thuốc nếu có). */
export const getDetailForBenhNhan = async (mahosokham, mabenhnhan) => {
  const h = await pool.query(
    `
    SELECT h.*,
           nv.hoten AS bacsiphutrach_ten,
           lk.ngaykham::text AS ngaykham_luot,
           bn.hoten AS benhnhan_hoten,
           bn.gioitinh AS benhnhan_gioitinh,
           bn.namsinh AS benhnhan_namsinh
    FROM hosokhambenh h
    LEFT JOIN nhanvien nv ON h.bacsiphutrach = nv.manhanvien
    LEFT JOIN luotkham lk ON h.maluotkham = lk.maluotkham
    LEFT JOIN benhnhan bn ON h.mabenhnhan = bn.mabenhnhan
    WHERE h.mahosokham = $1 AND h.mabenhnhan = $2
    `,
    [mahosokham, mabenhnhan]
  );
  const row = h.rows[0];
  if (!row) return null;

  const cls = await pool.query(
    `
    SELECT c.machidinh, c.trangthai, cl.tendichvu, cl.loaidichvu
    FROM chidinhcanlamsang c
    JOIN canlamsang cl ON c.madichvu = cl.madichvu
    WHERE c.mahosokham = $1
    ORDER BY c.machidinh
    `,
    [mahosokham]
  );

  let donthuocChiTiet = [];
  if (row.madonthuoc != null) {
    try {
      const dt = await pool.query(
        `
        SELECT ct.soluong, ct.lieudung, ct.cachdung,
               COALESCE(t.tenthuoc, v.tenvattu, '') AS tenthuoc
        FROM chitietdonthuoc ct
        LEFT JOIN danhmucthuoc t ON ct.mathuoc = t.mathuoc
        LEFT JOIN danhmucvattu v ON ct.mavattu = v.mavattu
        WHERE ct.madonthuoc = $1
        ORDER BY ct.id
        `,
        [row.madonthuoc]
      );
      donthuocChiTiet = dt.rows;
    } catch {
      donthuocChiTiet = [];
    }
  }

  return { ...row, chidinh: cls.rows, donthuocChiTiet };
};

export const create = async (data) => {
  const query = `
    INSERT INTO hosokhambenh (
      mabenhnhan, khoakham, bacsiphutrach, lydokham, 
      trieuchungbandau, tieusubenh, tiensuphauthuat, diung, 
      chandoansobo, ketluan, ngayhentaikham, ketquacanlamsang, 
      trangthai, maluotkham, madonthuoc
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    RETURNING *
  `;
  const values = [
    data.mabenhnhan, data.khoakham, data.bacsiphutrach, data.lydokham,
    data.trieuchungbandau, data.tieusubenh, data.tiensuphauthuat, data.diung,
    data.chandoansobo, data.ketluan, data.ngayhentaikham, data.ketquacanlamsang,
    data.trangthai, data.maluotkham, data.madonthuoc ?? null
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const update = async (id, data) => {
  const query = `
    UPDATE hosokhambenh SET
      mabenhnhan=$1, khoakham=$2, bacsiphutrach=$3, lydokham=$4, 
      trieuchungbandau=$5, tieusubenh=$6, tiensuphauthuat=$7, diung=$8, 
      chandoansobo=$9, ketluan=$10, ngayhentaikham=$11, ketquacanlamsang=$12, 
      trangthai=$13, maluotkham=$14, madonthuoc=$15
    WHERE mahosokham=$16
    RETURNING *
  `;
  const values = [
    data.mabenhnhan, data.khoakham, data.bacsiphutrach, data.lydokham,
    data.trieuchungbandau, data.tieusubenh, data.tiensuphauthuat, data.diung,
    data.chandoansobo, data.ketluan, data.ngayhentaikham, data.ketquacanlamsang,
    data.trangthai, data.maluotkham, data.madonthuoc ?? null, id
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const remove = async (id) => {
  const result = await pool.query(
    "DELETE FROM hosokhambenh WHERE mahosokham=$1 RETURNING *",
    [id]
  );
  return result.rows[0];
};

export const updateTrangThai = async (mahosokham, trangthai) => {
  const result = await pool.query(
    `UPDATE hosokhambenh SET trangthai = $2 WHERE mahosokham = $1 RETURNING *`,
    [mahosokham, trangthai]
  );
  return result.rows[0];
};