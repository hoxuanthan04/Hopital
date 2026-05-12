-- Liên kết mã đơn PayOS (orderCode) với hóa đơn nội bộ để xử lý webhook.
-- Chạy một lần trên PostgreSQL: psql -f migrations/001_payos_payment_pending.sql

CREATE TABLE IF NOT EXISTS public.payos_payment_pending (
    order_code bigint NOT NULL,
    mahoadon integer NOT NULL,
    amount_vnd integer NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT payos_payment_pending_pkey PRIMARY KEY (order_code),
    CONSTRAINT payos_payment_pending_mahoadon_fkey
        FOREIGN KEY (mahoadon) REFERENCES public.hoadonthanhtoan (mahoadon) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_payos_pending_mahoadon ON public.payos_payment_pending (mahoadon);
