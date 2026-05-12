-- Thông báo nội bộ: một bản ghi thông báo + nhiều người nhận (đọc/chưa đọc).
-- Chạy: psql -f backend/migrations/004_thong_bao.sql

CREATE TABLE IF NOT EXISTS public.thong_bao (
    id BIGSERIAL PRIMARY KEY,
    tieu_de character varying(280) NOT NULL,
    noi_dung text NOT NULL,
    nguoi_tao integer,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT thong_bao_nguoi_tao_fkey FOREIGN KEY (nguoi_tao)
        REFERENCES public.taikhoan (mataikhoan) ON UPDATE NO ACTION ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.thong_bao_nhan (
    id BIGSERIAL PRIMARY KEY,
    thong_bao_id bigint NOT NULL,
    mataikhoan integer NOT NULL,
    da_doc boolean NOT NULL DEFAULT false,
    read_at timestamp with time zone,
    CONSTRAINT thong_bao_nhan_thong_bao_fkey FOREIGN KEY (thong_bao_id)
        REFERENCES public.thong_bao (id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT thong_bao_nhan_taikhoan_fkey FOREIGN KEY (mataikhoan)
        REFERENCES public.taikhoan (mataikhoan) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT uq_thong_bao_nhan UNIQUE (thong_bao_id, mataikhoan)
);

CREATE INDEX IF NOT EXISTS idx_thong_bao_created ON public.thong_bao (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_thong_bao_nhan_tb ON public.thong_bao_nhan (thong_bao_id);
CREATE INDEX IF NOT EXISTS idx_thong_bao_nhan_user ON public.thong_bao_nhan (mataikhoan);
CREATE INDEX IF NOT EXISTS idx_thong_bao_nhan_chua_doc ON public.thong_bao_nhan (mataikhoan) WHERE da_doc = false;
