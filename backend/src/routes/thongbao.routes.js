import express from "express";
import { verifyToken, requireRole } from "../middleware/auth.middleware.js";
import * as ThongBaoController from "../controllers/thongbao.controller.js";

const router = express.Router();

router.get("/mine", verifyToken, ThongBaoController.listMine);
router.get("/unread-count", verifyToken, ThongBaoController.unreadCount);
router.patch("/read-all", verifyToken, ThongBaoController.markAllRead);
router.get("/admin-list", verifyToken, requireRole("Admin"), ThongBaoController.listAllAdmin);
router.post("/", verifyToken, requireRole("Admin"), ThongBaoController.create);
router.patch("/:id/read", verifyToken, ThongBaoController.markRead);

export default router;
