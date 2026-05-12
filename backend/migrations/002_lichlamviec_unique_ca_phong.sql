-- Ràng buộc phân ca: không trùng phòng trong cùng ca/ngày; không trùng nhân viên trong cùng ca/ngày.
-- Chạy trên PostgreSQL sau khi đã có bảng lichlamviec.

CREATE UNIQUE INDEX IF NOT EXISTS uq_lichlamviec_phong_ca_ngay
    ON public.lichlamviec (maphong, calam, ngay);

CREATE UNIQUE INDEX IF NOT EXISTS uq_lichlamviec_nhanvien_ca_ngay
    ON public.lichlamviec (manhanvien, calam, ngay);
