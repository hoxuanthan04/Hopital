-- =============================================================================
-- Cơ sở dữ liệu bệnh viện (PostgreSQL)
-- Chuẩn hóa từ bản ERD pgAdmin: FK đầy đủ hơn, index, transaction đúng cú pháp.
-- Chạy toàn bộ file một lần (một transaction). Yêu cầu database trống hoặc
-- đã DROP các bảng/constraint cũ nếu đổi tên cột.
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- Bảng gốc (không phụ thuộc FK nội bộ)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.benhnhan
(
    mabenhnhan serial NOT NULL,
    hoten character varying(100),
    gioitinh character varying(10),
    namsinh integer,
    socccd character varying(20),
    mabhyt character varying(20),
    quoctich character varying(50),
    dantoc character varying(50),
    diachi character varying(200),
    email character varying(100),
    dienthoai character varying(20),
    nghenghiep character varying(100),
    ngaytao timestamp without time zone NOT NULL DEFAULT now(),
    CONSTRAINT benhnhan_pkey PRIMARY KEY (mabenhnhan)
);

COMMENT ON COLUMN public.benhnhan.ngaytao IS 'Thời điểm tạo hồ sơ BN (dùng thống kê BN mới).';

CREATE TABLE IF NOT EXISTS public.canlamsang
(
    madichvu serial NOT NULL,
    tendichvu character varying(200),
    loaidichvu character varying(100),
    gia numeric(18, 2),
    mota character varying(300),
    trangthai character varying(50) DEFAULT 'Đang hoạt động'::character varying,
    CONSTRAINT canlamsang_pkey PRIMARY KEY (madichvu)
);

CREATE TABLE IF NOT EXISTS public.chuyenkhoa
(
    machuyenkhoa serial NOT NULL,
    tenchuyenkhoa character varying(150) NOT NULL,
    mota text,
    trangthai boolean DEFAULT true,
    CONSTRAINT chuyenkhoa_pkey PRIMARY KEY (machuyenkhoa)
);

CREATE TABLE IF NOT EXISTS public.nhanvien
(
    manhanvien serial NOT NULL,
    anh character varying(200),
    hoten character varying(100),
    ngaysinh date,
    gioitinh character varying(10),
    socccd character varying(20),
    sdt character varying(20),
    email character varying(100),
    chucvu character varying(100),
    hocham character varying(100),
    chuyenkhoa character varying(100),
    CONSTRAINT nhanvien_pkey PRIMARY KEY (manhanvien)
);

CREATE TABLE IF NOT EXISTS public.phongkham
(
    maphong serial NOT NULL,
    tenphong character varying(100),
    khoa character varying(100),
    chucnang character varying(200),
    tang character varying(10),
    khu character varying(50),
    trangthai character varying(50),
    mamayphong character varying(100),
    machuyenkhoa integer,
    CONSTRAINT phongkham_pkey PRIMARY KEY (maphong)
);

CREATE TABLE IF NOT EXISTS public.danhmucthuoc
(
    mathuoc serial NOT NULL,
    tenthuoc character varying(200),
    hamluong character varying(100),
    nhomthuoc character varying(100),
    donvi character varying(50),
    giaban numeric(18, 2),
    nhacungcap character varying(200),
    chophepbanweb boolean,
    CONSTRAINT danhmucthuoc_pkey PRIMARY KEY (mathuoc)
);

CREATE TABLE IF NOT EXISTS public.danhmucvattu
(
    mavattu serial NOT NULL,
    tenvattu character varying(200),
    loaivattu character varying(100),
    nhasanxuat character varying(200),
    hangsanxuat character varying(200),
    thanhphan character varying(300),
    huongdansudung character varying(300),
    congdung character varying(200),
    doituongsudung character varying(100),
    chophepbanweb boolean,
    giaban numeric(18, 2) DEFAULT 0,
    CONSTRAINT danhmucvattu_pkey PRIMARY KEY (mavattu)
);

CREATE TABLE IF NOT EXISTS public.dangkyhenkham
(
    id serial NOT NULL,
    hoten character varying(100),
    socccd character varying(20),
    sodienthoai character varying(20),
    namsinh integer,
    loaikham character varying(100),
    lydokham character varying(200),
    ngaykham date,
    giokham character varying(20),
    ngaydangky date DEFAULT CURRENT_DATE,
    trangthai character varying(50),
    CONSTRAINT dangkyhenkham_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.lichsubenhan
(
    id serial NOT NULL,
    mabenhnhan integer,
    diung character varying(200),
    tiensubenh character varying(300),
    tiensuphauthuat character varying(300),
    benh_nen character varying(200),
    ghichu character varying(200),
    CONSTRAINT lichsubenhan_pkey PRIMARY KEY (id)
);

COMMENT ON COLUMN public.lichsubenhan.benh_nen IS 'Bệnh nền (trước đây ghi nhầm benhnen).';

CREATE TABLE IF NOT EXISTS public.taikhoan
(
    mataikhoan serial NOT NULL,
    tentaikhoan character varying(50),
    matkhau character varying(200),
    manguoidung integer,
    trangthai character varying(50),
    loaitaikhoan character varying(50),
    isdelete boolean DEFAULT false,
    CONSTRAINT taikhoan_pkey PRIMARY KEY (mataikhoan)
);

-- ---------------------------------------------------------------------------
-- Lượt khám, hồ sơ, chỉ định CLS (phụ thuộc benhnhan / phòng)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.luotkham
(
    maluotkham serial NOT NULL,
    mabenhnhan integer NOT NULL,
    ngaykham date NOT NULL,
    lydokham character varying(255),
    loaihinhkham character varying(100),
    trangthai character varying(50),
    maphong integer,
    CONSTRAINT luotkham_pkey PRIMARY KEY (maluotkham)
);

CREATE TABLE IF NOT EXISTS public.hosokhambenh
(
    mahosokham serial NOT NULL,
    mabenhnhan integer,
    khoakham character varying(100),
    bacsiphutrach integer,
    lydokham character varying(300),
    trieuchungbandau character varying(300),
    tieusubenh character varying(300),
    tiensuphauthuat character varying(300),
    diung character varying(200),
    chandoansobo character varying(300),
    ketluan character varying(300),
    ngayhentaikham date,
    ketquacanlamsang character varying(200),
    trangthai character varying(50),
    maluotkham integer,
    madonthuoc integer,
    CONSTRAINT hosokhambenh_pkey PRIMARY KEY (mahosokham)
);

CREATE TABLE IF NOT EXISTS public.chidinhcanlamsang
(
    machidinh serial NOT NULL,
    mahosokham integer,
    madichvu integer,
    bacsichidinh integer,
    ngaychidinh date DEFAULT CURRENT_DATE,
    giochidinh character varying(20),
    trangthai character varying(50),
    CONSTRAINT chidinhcanlamsang_pkey PRIMARY KEY (machidinh)
);

CREATE TABLE IF NOT EXISTS public.ketquacanlamsang
(
    maketqua serial NOT NULL,
    machidinh integer,
    fileketqua character varying(300),
    ketluan character varying(300),
    bacsithuchien integer,
    thoigiantraketqua timestamp without time zone DEFAULT now(),
    CONSTRAINT ketquacanlamsang_pkey PRIMARY KEY (maketqua)
);

-- ---------------------------------------------------------------------------
-- Đơn thuốc, hóa đơn
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.donthuoc
(
    madonthuoc serial NOT NULL,
    bacsikedon integer,
    ngaykedon date DEFAULT CURRENT_DATE,
    mabenhnhan integer,
    CONSTRAINT donthuoc_pkey PRIMARY KEY (madonthuoc)
);

CREATE TABLE IF NOT EXISTS public.chitietdonthuoc
(
    id serial NOT NULL,
    madonthuoc integer,
    mathuoc integer,
    mavattu integer,
    soluong integer NOT NULL DEFAULT 1,
    lieudung character varying(200),
    cachdung character varying(200),
    CONSTRAINT chitietdonthuoc_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.hoadonthanhtoan
(
    mahoadon serial NOT NULL,
    mabenhnhan integer,
    danhsachdichvu text,
    sotienbaohiemchitra numeric(18, 2) DEFAULT 0,
    thuctracuabenhnhan numeric(18, 2) DEFAULT 0,
    tongtien numeric(18, 2) NOT NULL DEFAULT 0,
    ngaylap date NOT NULL DEFAULT CURRENT_DATE,
    trangthai character varying(50) DEFAULT 'Chưa thanh toán'::character varying,
    CONSTRAINT hoadonthanhtoan_pkey PRIMARY KEY (mahoadon),
    CONSTRAINT ck_hoadon_tongtien CHECK (tongtien >= 0::numeric)
);

CREATE TABLE IF NOT EXISTS public.hoadon_dichvu
(
    id serial NOT NULL,
    mahoadon integer NOT NULL,
    madichvu integer,
    soluong integer NOT NULL DEFAULT 1,
    dongia numeric(18, 2) NOT NULL DEFAULT 0,
    thanhtien numeric(18, 2) NOT NULL DEFAULT 0,
    CONSTRAINT hoadon_dichvu_pkey PRIMARY KEY (id),
    CONSTRAINT ck_hoadon_dichvu_thanhtien CHECK (thanhtien >= 0::numeric AND soluong > 0)
);

-- ---------------------------------------------------------------------------
-- Vật tư, phiếu nhập, lịch làm việc
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.phieunhap
(
    maphieunhap serial NOT NULL,
    mavattu integer,
    gia numeric(18, 2),
    soluong integer,
    donvitinh character varying(50),
    phongluutru character varying(50),
    keluutru character varying(50),
    hansudung date,
    nhacungcap character varying(200),
    trangthaivattu character varying(50),
    ghichu character varying(200),
    CONSTRAINT phieunhap_pkey PRIMARY KEY (maphieunhap)
);

CREATE TABLE IF NOT EXISTS public.lichlamviec
(
    id serial NOT NULL,
    manhanvien integer,
    maphong integer,
    calam character varying(50),
    ngay date,
    ghichu character varying(200),
    CONSTRAINT lichlamviec_pkey PRIMARY KEY (id)
);

-- =============================================================================
-- Khóa ngoại
-- =============================================================================

ALTER TABLE public.luotkham
    ADD CONSTRAINT fk_luotkham_benhnhan FOREIGN KEY (mabenhnhan)
    REFERENCES public.benhnhan (mabenhnhan)
    ON UPDATE CASCADE
    ON DELETE RESTRICT;

ALTER TABLE public.luotkham
    ADD CONSTRAINT fk_luotkham_phongkham FOREIGN KEY (maphong)
    REFERENCES public.phongkham (maphong)
    ON UPDATE NO ACTION
    ON DELETE SET NULL;

ALTER TABLE public.phongkham
    ADD CONSTRAINT fk_phongkham_chuyenkhoa FOREIGN KEY (machuyenkhoa)
    REFERENCES public.chuyenkhoa (machuyenkhoa)
    ON UPDATE NO ACTION
    ON DELETE SET NULL;

ALTER TABLE public.hosokhambenh
    ADD CONSTRAINT fk_hoso_luotkham FOREIGN KEY (maluotkham)
    REFERENCES public.luotkham (maluotkham)
    ON UPDATE CASCADE
    ON DELETE CASCADE;

ALTER TABLE public.hosokhambenh
    ADD CONSTRAINT hosokhambenh_mabenhnhan_fkey FOREIGN KEY (mabenhnhan)
    REFERENCES public.benhnhan (mabenhnhan)
    ON UPDATE NO ACTION
    ON DELETE CASCADE;

ALTER TABLE public.hosokhambenh
    ADD CONSTRAINT hosokhambenh_bacsiphutrach_fkey FOREIGN KEY (bacsiphutrach)
    REFERENCES public.nhanvien (manhanvien)
    ON UPDATE NO ACTION
    ON DELETE SET NULL;

ALTER TABLE public.chidinhcanlamsang
    ADD CONSTRAINT chidinhcanlamsang_madichvu_fkey FOREIGN KEY (madichvu)
    REFERENCES public.canlamsang (madichvu)
    ON UPDATE NO ACTION
    ON DELETE RESTRICT;

ALTER TABLE public.chidinhcanlamsang
    ADD CONSTRAINT chidinhcanlamsang_mahosokham_fkey FOREIGN KEY (mahosokham)
    REFERENCES public.hosokhambenh (mahosokham)
    ON UPDATE NO ACTION
    ON DELETE CASCADE;

ALTER TABLE public.chidinhcanlamsang
    ADD CONSTRAINT chidinhcanlamsang_bacsichidinh_fkey FOREIGN KEY (bacsichidinh)
    REFERENCES public.nhanvien (manhanvien)
    ON UPDATE NO ACTION
    ON DELETE SET NULL;

ALTER TABLE public.ketquacanlamsang
    ADD CONSTRAINT ketquacanlamsang_machidinh_fkey FOREIGN KEY (machidinh)
    REFERENCES public.chidinhcanlamsang (machidinh)
    ON UPDATE NO ACTION
    ON DELETE CASCADE;

ALTER TABLE public.ketquacanlamsang
    ADD CONSTRAINT ketquacanlamsang_bacsithuchien_fkey FOREIGN KEY (bacsithuchien)
    REFERENCES public.nhanvien (manhanvien)
    ON UPDATE NO ACTION
    ON DELETE SET NULL;

ALTER TABLE public.donthuoc
    ADD CONSTRAINT donthuoc_mabenhnhan_fkey FOREIGN KEY (mabenhnhan)
    REFERENCES public.benhnhan (mabenhnhan)
    ON UPDATE NO ACTION
    ON DELETE CASCADE;

ALTER TABLE public.donthuoc
    ADD CONSTRAINT donthuoc_bacsikedon_fkey FOREIGN KEY (bacsikedon)
    REFERENCES public.nhanvien (manhanvien)
    ON UPDATE NO ACTION
    ON DELETE SET NULL;

ALTER TABLE public.hosokhambenh
    ADD CONSTRAINT hosokhambenh_madonthuoc_fkey FOREIGN KEY (madonthuoc)
    REFERENCES public.donthuoc (madonthuoc)
    ON UPDATE NO ACTION
    ON DELETE SET NULL;

ALTER TABLE public.chitietdonthuoc
    ADD CONSTRAINT chitietdonthuoc_madonthuoc_fkey FOREIGN KEY (madonthuoc)
    REFERENCES public.donthuoc (madonthuoc)
    ON UPDATE NO ACTION
    ON DELETE CASCADE;

ALTER TABLE public.chitietdonthuoc
    ADD CONSTRAINT chitietdonthuoc_mathuoc_fkey FOREIGN KEY (mathuoc)
    REFERENCES public.danhmucthuoc (mathuoc)
    ON UPDATE NO ACTION
    ON DELETE RESTRICT;

ALTER TABLE public.chitietdonthuoc
    ADD CONSTRAINT chitietdonthuoc_mavattu_fkey FOREIGN KEY (mavattu)
    REFERENCES public.danhmucvattu (mavattu)
    ON UPDATE NO ACTION
    ON DELETE RESTRICT;

ALTER TABLE public.hoadonthanhtoan
    ADD CONSTRAINT hoadonthanhtoan_mabenhnhan_fkey FOREIGN KEY (mabenhnhan)
    REFERENCES public.benhnhan (mabenhnhan)
    ON UPDATE NO ACTION
    ON DELETE RESTRICT;

ALTER TABLE public.hoadon_dichvu
    ADD CONSTRAINT hoadon_dichvu_mahoadon_fkey FOREIGN KEY (mahoadon)
    REFERENCES public.hoadonthanhtoan (mahoadon)
    ON UPDATE CASCADE
    ON DELETE CASCADE;

ALTER TABLE public.hoadon_dichvu
    ADD CONSTRAINT hoadon_dichvu_madichvu_fkey FOREIGN KEY (madichvu)
    REFERENCES public.canlamsang (madichvu)
    ON UPDATE NO ACTION
    ON DELETE RESTRICT;

ALTER TABLE public.phieunhap
    ADD CONSTRAINT phieunhap_mavattu_fkey FOREIGN KEY (mavattu)
    REFERENCES public.danhmucvattu (mavattu)
    ON UPDATE NO ACTION
    ON DELETE RESTRICT;

ALTER TABLE public.lichlamviec
    ADD CONSTRAINT lichlamviec_manhanvien_fkey FOREIGN KEY (manhanvien)
    REFERENCES public.nhanvien (manhanvien)
    ON UPDATE NO ACTION
    ON DELETE CASCADE;

ALTER TABLE public.lichlamviec
    ADD CONSTRAINT lichlamviec_maphong_fkey FOREIGN KEY (maphong)
    REFERENCES public.phongkham (maphong)
    ON UPDATE NO ACTION
    ON DELETE SET NULL;

ALTER TABLE public.lichsubenhan
    ADD CONSTRAINT lichsubenhan_mabenhnhan_fkey FOREIGN KEY (mabenhnhan)
    REFERENCES public.benhnhan (mabenhnhan)
    ON UPDATE NO ACTION
    ON DELETE CASCADE;

ALTER TABLE public.taikhoan
    ADD CONSTRAINT taikhoan_manguoidung_fkey FOREIGN KEY (manguoidung)
    REFERENCES public.nhanvien (manhanvien)
    ON UPDATE NO ACTION
    ON DELETE CASCADE;

-- =============================================================================
-- Chỉ mục (truy vấn dashboard, danh sách, báo cáo)
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_luotkham_ngaykham ON public.luotkham (ngaykham DESC);
CREATE INDEX IF NOT EXISTS idx_luotkham_mabenhnhan ON public.luotkham (mabenhnhan);
CREATE INDEX IF NOT EXISTS idx_luotkham_maphong ON public.luotkham (maphong);

CREATE INDEX IF NOT EXISTS idx_hosokhambenh_maluotkham ON public.hosokhambenh (maluotkham);
CREATE INDEX IF NOT EXISTS idx_hosokhambenh_mabenhnhan ON public.hosokhambenh (mabenhnhan);

CREATE INDEX IF NOT EXISTS idx_chidinh_mahosokham ON public.chidinhcanlamsang (mahosokham);
CREATE INDEX IF NOT EXISTS idx_chidinh_madichvu ON public.chidinhcanlamsang (madichvu);
CREATE UNIQUE INDEX IF NOT EXISTS uq_chidinh_hoso_madichvu ON public.chidinhcanlamsang (mahosokham, madichvu);

CREATE INDEX IF NOT EXISTS idx_hoadon_dichvu_mahoadon ON public.hoadon_dichvu (mahoadon);
CREATE INDEX IF NOT EXISTS idx_hoadonthanhtoan_mabenhnhan ON public.hoadonthanhtoan (mabenhnhan);
CREATE INDEX IF NOT EXISTS idx_hoadonthanhtoan_ngaylap ON public.hoadonthanhtoan (ngaylap DESC);

CREATE INDEX IF NOT EXISTS idx_dangkyhenkham_ngaykham ON public.dangkyhenkham (ngaykham);
CREATE INDEX IF NOT EXISTS idx_benhnhan_ngaytao ON public.benhnhan (ngaytao DESC);

CREATE UNIQUE INDEX IF NOT EXISTS uq_lichlamviec_phong_ca_ngay ON public.lichlamviec (maphong, calam, ngay);
CREATE UNIQUE INDEX IF NOT EXISTS uq_lichlamviec_nhanvien_ca_ngay ON public.lichlamviec (manhanvien, calam, ngay);

COMMIT;
