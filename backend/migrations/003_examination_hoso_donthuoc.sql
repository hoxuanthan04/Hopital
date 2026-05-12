-- Hỗ trợ đơn thuốc từ danhmucvattu (loại thuốc) và liên kết đơn với hồ sơ khám.
-- Chạy sau khi đã có các bảng hosokhambenh, donthuoc, chitietdonthuoc, danhmucvattu.

ALTER TABLE public.hosokhambenh
    ADD COLUMN IF NOT EXISTS madonthuoc integer;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'hosokhambenh_madonthuoc_fkey'
    ) THEN
        ALTER TABLE public.hosokhambenh
            ADD CONSTRAINT hosokhambenh_madonthuoc_fkey
            FOREIGN KEY (madonthuoc) REFERENCES public.donthuoc (madonthuoc)
            ON UPDATE NO ACTION ON DELETE SET NULL;
    END IF;
END $$;

ALTER TABLE public.chitietdonthuoc
    ADD COLUMN IF NOT EXISTS mavattu integer;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chitietdonthuoc_mavattu_fkey'
    ) THEN
        ALTER TABLE public.chitietdonthuoc
            ADD CONSTRAINT chitietdonthuoc_mavattu_fkey
            FOREIGN KEY (mavattu) REFERENCES public.danhmucvattu (mavattu)
            ON UPDATE NO ACTION ON DELETE RESTRICT;
    END IF;
END $$;

DO $$
BEGIN
    ALTER TABLE public.chitietdonthuoc ALTER COLUMN mathuoc DROP NOT NULL;
EXCEPTION
    WHEN undefined_column THEN NULL;
END $$;
