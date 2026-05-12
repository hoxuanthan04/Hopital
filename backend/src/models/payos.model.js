import pool from "../config/db.js";

export const insertPending = async ({ orderCode, mahoadon, amountVnd }) => {
  const r = await pool.query(
    `INSERT INTO payos_payment_pending (order_code, mahoadon, amount_vnd)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [orderCode, mahoadon, amountVnd]
  );
  return r.rows[0];
};

export const getPendingByOrderCode = async (orderCode) => {
  const r = await pool.query(
    `SELECT * FROM payos_payment_pending WHERE order_code = $1`,
    [orderCode]
  );
  return r.rows[0];
};

export const deletePending = async (orderCode) => {
  await pool.query(`DELETE FROM payos_payment_pending WHERE order_code = $1`, [
    orderCode,
  ]);
};
