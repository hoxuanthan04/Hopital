-- Lưu kết quả thực hiện chỉ định cận lâm sàng / chẩn đoán hình ảnh.

ALTER TABLE public.chidinhcanlamsang
    ADD COLUMN IF NOT EXISTS ketquahinhanh text,
    ADD COLUMN IF NOT EXISTS dicom_url text,
    ADD COLUMN IF NOT EXISTS dicom_public_id varchar(300),
    ADD COLUMN IF NOT EXISTS dicom_tenfile varchar(255),
    ADD COLUMN IF NOT EXISTS ngaythuchien timestamp with time zone;
