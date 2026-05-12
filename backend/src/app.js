import express from "express";
import cors from "cors";
import "./config/db.js";
import benhnhanRoutes from "./routes/benhnhan.routes.js";
import nhanVienRoutes from "./routes/nhanvien.routes.js"
import phongkhamRoures from "./routes/phongkham.routes.js"
import vattuRoutes from "./routes/vattu.routes.js"
import taikhoanRoutes from "./routes/taikhoan.routes.js"
import uploadRoutes from "./routes/upload.route.js"
import dangkyhenkhamRoutes from './routes/dangkyhenkham.routes.js'
import chuyenkhoaRoutes from './routes/chuyenkhoa.routes.js'
import canlamsangRoutes from './routes/canlamsang.routes.js'
import luotkhamRoutes from './routes/luotkham.route.js'
import hosokhambenhRoutes from './routes/hosokhambenh.routes.js'
import examinationRoutes from './routes/examination.routes.js'
import lichlamviecRoutes from './routes/lichlamviec.routes.js'
import dashboardRoutes from './routes/dashboard.routes.js'
import hoadonRoutes from './routes/hoadon.routes.js'
import payosRoutes from './routes/payos.routes.js'
import chatRoutes from './routes/chat.routes.js'
import thongBaoRoutes from './routes/thongbao.routes.js'

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/api/benhnhan", benhnhanRoutes); 
app.use("/api/nhanvien", nhanVienRoutes);
app.use("/api/phongkham", phongkhamRoures);
app.use("/api/vattu", vattuRoutes);
app.use("/api/taikhoan", taikhoanRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/dangkyhenkham", dangkyhenkhamRoutes);
app.use("/api/chuyenkhoa", chuyenkhoaRoutes);
app.use("/api/canlamsang", canlamsangRoutes);
app.use("/api/luotkham", luotkhamRoutes);
app.use("/api/hosokhambenh", hosokhambenhRoutes);
app.use("/api/examination", examinationRoutes);
app.use("/api/lichlamviec", lichlamviecRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/hoadon", hoadonRoutes);
app.use("/api/payos", payosRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/thongbao", thongBaoRoutes);

export default app;