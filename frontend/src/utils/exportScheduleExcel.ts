import * as XLSX from 'xlsx';

export type ScheduleExportRow = {
  ngay: string;
  tennhanvien?: string | null;
  manhanvien: number;
  tenphong?: string | null;
  maphong: number;
  calam: string;
  ghichu?: string | null;
};

/** Xuất danh sách lịch làm việc ra file .xlsx (client). */
export function exportSchedulesToXlsx(
  data: ScheduleExportRow[],
  fileBaseName: string,
  sheetName: string
): void {
  if (!data.length) return;

  const sorted = [...data].sort(
    (a, b) => a.ngay.localeCompare(b.ngay) || a.calam.localeCompare(b.calam, 'vi')
  );

  const header = ['STT', 'Ngày', 'Nhân viên', 'Mã nhân viên', 'Phòng khám', 'Mã phòng', 'Ca làm việc', 'Ghi chú'];
  const aoa: (string | number)[][] = [
    header,
    ...sorted.map((r, i) => [
      i + 1,
      r.ngay.slice(0, 10),
      r.tennhanvien ?? '',
      r.manhanvien,
      r.tenphong ?? '',
      r.maphong,
      r.calam ?? '',
      (r.ghichu ?? '').toString(),
    ]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const wb = XLSX.utils.book_new();
  const safeSheet = sheetName.replace(/[[\]:*?/\\]/g, '_').slice(0, 31) || 'Lich';
  XLSX.utils.book_append_sheet(wb, ws, safeSheet);
  const safeFile = fileBaseName.replace(/[[\]:*?/\\]/g, '_');
  XLSX.writeFile(wb, `${safeFile}.xlsx`);
}
