import pool from "../config/db.js";

/**
 * Tổng hợp: luotkham, benhnhan, hoadonthanhtoan, chidinhcanlamsang,
 * top 5 chuyên khoa theo số hồ sơ khám (hosokhambenh), lượt khám theo tháng.
 */
export const getDashboardOverview = async () => {
  const year = new Date().getFullYear();

  const [luotKhamRes, benhNhanRes, doanhThuRes, clsRes, khoaRes, monthlyRes] =
    await Promise.all([
      pool.query("SELECT COUNT(*)::int AS c FROM luotkham"),
      pool.query("SELECT COUNT(*)::int AS c FROM benhnhan"),
      pool.query(
        "SELECT COALESCE(SUM(tongtien), 0)::float AS s FROM hoadonthanhtoan"
      ),
      pool.query("SELECT COUNT(*)::int AS c FROM chidinhcanlamsang"),
      pool.query(`
        WITH per_khoa AS (
          SELECT ck.machuyenkhoa,
                 ck.tenchuyenkhoa AS name,
                 COUNT(h.mahosokham)::int AS patients
          FROM chuyenkhoa ck
          LEFT JOIN hosokhambenh h
            ON NULLIF(TRIM(h.khoakham), '') IS NOT NULL
           AND (
                 TRIM(h.khoakham) = TRIM(ck.tenchuyenkhoa)
              OR TRIM(h.khoakham) = ck.machuyenkhoa::text
              OR LOWER(TRIM(h.khoakham)) = LOWER(TRIM(ck.tenchuyenkhoa))
             )
          GROUP BY ck.machuyenkhoa, ck.tenchuyenkhoa
        ),
        with_total AS (
          SELECT pk.*, SUM(pk.patients) OVER ()::int AS total_patients_all
          FROM per_khoa pk
        )
        SELECT name, patients, total_patients_all
        FROM with_total
        WHERE patients > 0
        ORDER BY patients DESC, name ASC
        LIMIT 5
      `),
      pool.query(
        `
        SELECT EXTRACT(MONTH FROM ngaykham)::int AS m, COUNT(*)::int AS patients
        FROM luotkham
        WHERE ngaykham IS NOT NULL AND EXTRACT(YEAR FROM ngaykham) = $1
        GROUP BY EXTRACT(MONTH FROM ngaykham)
        ORDER BY m
      `,
        [year]
      ),
    ]);

  const byMonth = {};
  for (const row of monthlyRes.rows) {
    byMonth[row.m] = row.patients;
  }
  const monthlyLuotKham = [];
  for (let m = 1; m <= 12; m++) {
    monthlyLuotKham.push({
      month: `T${m}`,
      patients: byMonth[m] ?? 0,
    });
  }

  const totalDoanhThu = Number(doanhThuRes.rows[0]?.s ?? 0);

  const totalPatientsAll = Number(khoaRes.rows[0]?.total_patients_all ?? 0);

  const khoaStats = khoaRes.rows.map((r) => ({
    name: r.name,
    patients: r.patients,
    revenue: 0,
  }));

  if (totalPatientsAll > 0 && totalDoanhThu > 0) {
    for (const row of khoaStats) {
      row.revenue = Math.round((row.patients / totalPatientsAll) * totalDoanhThu);
    }
    const drift = Math.round(totalDoanhThu) - khoaStats.reduce((s, r) => s + r.revenue, 0);
    if (khoaStats.length && drift !== 0) {
      khoaStats[khoaStats.length - 1].revenue += drift;
    }
  }

  return {
    summary: {
      luotKham: luotKhamRes.rows[0]?.c ?? 0,
      benhNhan: benhNhanRes.rows[0]?.c ?? 0,
      doanhThu: totalDoanhThu,
      canLamSang: clsRes.rows[0]?.c ?? 0,
    },
    khoaStats,
    monthlyLuotKham,
    year,
  };
};
