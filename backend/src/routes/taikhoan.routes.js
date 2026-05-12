import express from "express";
import * as TaiKhoanController from "../controllers/taikhoan.controller.js";

const router = express.Router();


router.post("/login", TaiKhoanController.login);

router.get("/", TaiKhoanController.getAccounts);
router.delete("/soft-delete/:id", TaiKhoanController.softDeleteAccount);
router.patch("/toggle-status/:id", TaiKhoanController.toggleAccountStatus);
router.patch("/change-role/:id", TaiKhoanController.changeAccountRole);
router.post("/", TaiKhoanController.createAccount);

export default router;