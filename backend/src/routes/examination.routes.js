import express from "express";
import {
  session,
  postChidinh,
  deleteChidinh,
  patchChidinhHoanThanh,
  patchChidinhKetQua,
  postComplete,
  postStartCls,
  getChidinhByPhong,
  patchChidinhDangThucHien,
} from "../controllers/examination.controller.js";

const router = express.Router();

router.get("/session", session);
router.get("/chidinh/phong/:maphong", getChidinhByPhong);
router.post("/chidinh", postChidinh);
router.delete("/chidinh/:id", deleteChidinh);
router.patch("/chidinh/:id/dangthuchien", patchChidinhDangThucHien);
router.patch("/chidinh/:id/hoanthanh", patchChidinhHoanThanh);
router.patch("/chidinh/:id/ketqua", patchChidinhKetQua);
router.post("/start-cls", postStartCls);
router.post("/complete", postComplete);

export default router;
