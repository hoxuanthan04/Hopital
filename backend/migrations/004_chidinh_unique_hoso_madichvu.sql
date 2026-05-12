-- Mỗi hồ sơ khám không chỉ định trùng cùng một madichvu (cùng một dịch vụ CLS).
-- Nếu lỗi khi tạo index: xóa bản ghi trùng (mahosokham + madichvu) rồi chạy lại.

CREATE UNIQUE INDEX IF NOT EXISTS uq_chidinh_hoso_madichvu
    ON public.chidinhcanlamsang (mahosokham, madichvu);
