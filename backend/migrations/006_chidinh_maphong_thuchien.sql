-- Lưu phòng được phân để thực hiện chỉ định cận lâm sàng.
-- Cho phép cân bằng tải bằng cách chọn phòng có ít người chờ nhất.

ALTER TABLE public.chidinhcanlamsang
    ADD COLUMN IF NOT EXISTS maphong_thuchien integer;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chidinh_maphong_thuchien_fkey'
    ) THEN
        ALTER TABLE public.chidinhcanlamsang
            ADD CONSTRAINT chidinh_maphong_thuchien_fkey
            FOREIGN KEY (maphong_thuchien) REFERENCES public.phongkham (maphong)
            ON UPDATE NO ACTION ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_chidinh_maphong_thuchien
    ON public.chidinhcanlamsang (maphong_thuchien);
