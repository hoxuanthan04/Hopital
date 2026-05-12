import express from "express";
import {
  getAllBenhNhan,
  getBenhNhanById,
  createBenhNhan,
  updateBenhNhan,
  deleteBenhNhan,
  lookupBenhNhanByCccd,
  lookupDienthoaiInUse
} from "../controllers/benhnhan.controller.js";

const router = express.Router();

router.get("/lookup/cccd", lookupBenhNhanByCccd);
router.get("/lookup/dienthoai", lookupDienthoaiInUse);
router.get("/", getAllBenhNhan);
router.get("/:id", getBenhNhanById);
router.post("/", createBenhNhan);
router.put("/:id", updateBenhNhan);
router.delete("/:id", deleteBenhNhan);

export default router;