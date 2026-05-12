import { getPayOSClient, handleVerifiedWebhookData, isPayOSConfigured } from "../services/payos.service.js";

/**
 * POST /api/payos/webhook
 * PayOS gửi JSON có code, desc, success, data, signature — dùng SDK verify.
 */
export const webhook = async (req, res) => {
  if (!isPayOSConfigured()) {
    return res.status(503).json({ message: "PayOS chưa cấu hình" });
  }
  const payos = getPayOSClient();
  try {
    const verified = await payos.webhooks.verify(req.body);
    const result = await handleVerifiedWebhookData(verified);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error("[payos webhook]", error?.message || error);
    return res.status(401).json({ message: error?.message || "Webhook không hợp lệ" });
  }
};
