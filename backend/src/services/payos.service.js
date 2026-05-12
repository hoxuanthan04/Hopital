import { PayOS } from "@payos/node";
import * as HoaDonService from "./hoadon.service.js";
import * as PayosModel from "../models/payos.model.js";

let client;

export function getPayOSClient() {
  const clientId = process.env.PAYOS_CLIENT_ID;
  const apiKey = process.env.PAYOS_API_KEY;
  const checksumKey = process.env.PAYOS_CHECKSUM_KEY;
  if (!clientId || !apiKey || !checksumKey) return null;
  if (!client) {
    client = new PayOS({
      clientId,
      apiKey,
      checksumKey,
      partnerCode: process.env.PAYOS_PARTNER_CODE || undefined,
    });
  }
  return client;
}

export function isPayOSConfigured() {
  return Boolean(
    process.env.PAYOS_CLIENT_ID &&
      process.env.PAYOS_API_KEY &&
      process.env.PAYOS_CHECKSUM_KEY
  );
}

function defaultReturnUrls() {
  const base =
    process.env.FRONTEND_PUBLIC_URL?.replace(/\/$/, "") ||
    "http://localhost:5173";
  return {
    returnUrl: process.env.PAYOS_RETURN_URL || `${base}/staff/invoicemanagement?payos=return`,
    cancelUrl: process.env.PAYOS_CANCEL_URL || `${base}/staff/invoicemanagement?payos=cancel`,
  };
}

function roundVndAmount(n) {
  return Math.max(0, Math.round(Number(n) || 0));
}

/**
 * Tạo link thanh toán PayOS cho phần bệnh nhân còn phải trả: tongtien - BHYT - đã thu.
 */
export async function createPaymentLinkForInvoice(mahoadon) {
  const payos = getPayOSClient();
  if (!payos) {
    throw new Error("Chưa cấu hình PayOS (PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY).");
  }

  const inv = await HoaDonService.getById(mahoadon);
  const tong = roundVndAmount(inv.tongtien);
  const bh = roundVndAmount(inv.sotienbaohiemchitra);
  const daThu = roundVndAmount(inv.thuctracuabenhnhan);
  const canThu = tong - bh - daThu;
  if (canThu <= 0) {
    throw new Error("Hóa đơn không còn số tiền cần thu qua PayOS.");
  }

  const orderCode = Date.now();
  await PayosModel.insertPending({
    orderCode,
    mahoadon: Number(mahoadon),
    amountVnd: canThu,
  });

  const { returnUrl, cancelUrl } = defaultReturnUrls();
  const description = `HDDT #${mahoadon}`.slice(0, 25);

  try {
    const link = await payos.paymentRequests.create({
      orderCode,
      amount: canThu,
      description,
      returnUrl,
      cancelUrl,
      items: [
        {
          name: description,
          quantity: 1,
          price: canThu,
        },
      ],
    });
    return {
      checkoutUrl: link.checkoutUrl,
      qrCode: link.qrCode,
      orderCode: link.orderCode,
      amount: canThu,
      paymentLinkId: link.paymentLinkId,
    };
  } catch (e) {
    await PayosModel.deletePending(orderCode).catch(() => {});
    throw e;
  }
}

/**
 * Xác thực webhook và cập nhật hóa đơn nếu khớp pending.
 */
export async function handleVerifiedWebhookData(data) {
  const orderCode = data.orderCode;
  if (orderCode == null) return { ok: true, skipped: true };

  const pending = await PayosModel.getPendingByOrderCode(orderCode);
  if (!pending) {
    return { ok: true, skipped: true, reason: "no_pending" };
  }

  const paidAmount = roundVndAmount(data.amount);
  if (paidAmount < pending.amount_vnd) {
    return { ok: true, skipped: true, reason: "underpaid", expected: pending.amount_vnd, got: paidAmount };
  }

  const inv = await HoaDonService.getById(pending.mahoadon);
  const tong = roundVndAmount(inv.tongtien);
  const bh = roundVndAmount(inv.sotienbaohiemchitra);
  const thuMoi = Math.max(0, tong - bh);

  await HoaDonService.update(pending.mahoadon, {
    mabenhnhan: inv.mabenhnhan,
    danhsachdichvu: inv.danhsachdichvu ?? "",
    sotienbaohiemchitra: bh,
    thuctracuabenhnhan: thuMoi,
    tongtien: tong,
  });

  const paidRow = await HoaDonService.getById(pending.mahoadon);
  if (HoaDonService.isInvoiceFullyPaid(paidRow)) {
    await HoaDonService.syncHoSoAfterInvoicePaid(paidRow);
  }

  await PayosModel.deletePending(orderCode);
  return { ok: true, mahoadon: pending.mahoadon };
}
