import express from "express";
import { 
  getAllLuotKham, 
  getLuotKhamById, 
  createLuotKham, 
  updateLuotKham, 
  deleteLuotKham,
  getLuotKhamByPhong 
} from "../controllers/luotkham.controller.js";

const router = express.Router();
router.get("/phong/:maphong", getLuotKhamByPhong);
router.get("/", getAllLuotKham);
router.get("/:id", getLuotKhamById);
router.post("/", createLuotKham); 
router.put("/:id", updateLuotKham);
router.delete("/:id", deleteLuotKham);


export default router;