import express from "express";
import multer from "multer";
import { cloudinary, isCloudinaryConfigured } from "../config/cloudinary.config.js";

const router = express.Router();

const uploadMem = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpeg|jpg|png|webp|gif)$/i.test(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new Error("Chỉ chấp nhận file ảnh (JPEG, PNG, WebP, GIF)."));
  },
});

const uploadDicomMem = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const name = String(file.originalname || "").toLowerCase();
    const mime = String(file.mimetype || "").toLowerCase();
    if (
      name.endsWith(".dcm") ||
      name.endsWith(".dicom") ||
      mime === "application/dicom" ||
      mime === "application/octet-stream"
    ) {
      cb(null, true);
      return;
    }
    cb(new Error("Chỉ chấp nhận file DICOM (.dcm/.dicom)."));
  },
});

/**
 * POST /api/upload/single?type=bacsi|nhanvien|general
 * multipart field name: image
 * Trả về { url } — URL lưu vào cột anh của nhanvien (không đổi schema).
 */
router.post(
  "/single",
  (req, res, next) => {
    if (!isCloudinaryConfigured()) {
      return res.status(503).json({
        message:
          "Cloudinary chưa cấu hình. Thêm CLOUDINARY_NAME (hoặc CLOUDINARY_CLOUD_NAME), CLOUDINARY_KEY (hoặc CLOUDINARY_API_KEY), CLOUDINARY_SECRET (hoặc CLOUDINARY_API_SECRET) vào .env backend.",
      });
    }
    next();
  },
  (req, res, next) => {
    uploadMem.single("image")(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message || "Upload thất bại" });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file?.buffer) {
        return res.status(400).json({ message: "Không có file ảnh (field: image)." });
      }
      const raw = String(req.query.type || "general");
      const type = raw.replace(/[^a-z0-9_-]/gi, "") || "general";
      const folder = `clinic_management/${type}`;
      const faceCrop = type === "bacsi" || type === "nhanvien";

      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: "image",
            ...(faceCrop
              ? {
                  transformation: [
                    { width: 400, height: 400, crop: "fill", gravity: "face" },
                  ],
                }
              : {}),
          },
          (error, uploaded) => {
            if (error) reject(error);
            else resolve(uploaded);
          }
        );
        stream.end(req.file.buffer);
      });

      res.json({ url: result.secure_url, publicId: result.public_id });
    } catch (e) {
      res.status(400).json({ message: e.message || "Upload Cloudinary thất bại." });
    }
  }
);

/**
 * POST /api/upload/dicom
 * multipart field name: dicom
 * Trả về { url, publicId, originalName } để lưu vào kết quả chỉ định CLS.
 */
router.post(
  "/dicom",
  (req, res, next) => {
    if (!isCloudinaryConfigured()) {
      return res.status(503).json({
        message:
          "Cloudinary chưa cấu hình. Thêm CLOUDINARY_NAME (hoặc CLOUDINARY_CLOUD_NAME), CLOUDINARY_KEY (hoặc CLOUDINARY_API_KEY), CLOUDINARY_SECRET (hoặc CLOUDINARY_API_SECRET) vào .env backend.",
      });
    }
    next();
  },
  (req, res, next) => {
    uploadDicomMem.single("dicom")(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message || "Upload DICOM thất bại" });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file?.buffer) {
        return res.status(400).json({ message: "Không có file DICOM (field: dicom)." });
      }

      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "clinic_management/dicom",
            resource_type: "raw",
            use_filename: true,
            unique_filename: true,
          },
          (error, uploaded) => {
            if (error) reject(error);
            else resolve(uploaded);
          }
        );
        stream.end(req.file.buffer);
      });

      res.json({
        url: result.secure_url,
        publicId: result.public_id,
        originalName: req.file.originalname,
      });
    } catch (e) {
      res.status(400).json({ message: e.message || "Upload DICOM thất bại." });
    }
  }
);

export default router;
