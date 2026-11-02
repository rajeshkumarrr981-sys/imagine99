import "server-only";
import nodemailer from "nodemailer";
import { money, TAX_LABEL } from "@/lib/pricing";

type MailOrder = {
  id: string;
  items: { title: string; quantity: number; price: number }[];
  subtotal: number;
  taxes: number;
  shippingCost: number;
  paymentMethod: "cod" | "upi";
  total: number;
  shippingAddress: { name: string; email: string; address: string; city: string; country: string; zip?: string };
};

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function transport() {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined,
  });
}

/** Sends the order confirmation. Without SMTP settings it logs the email instead. Never throws. */
export async function sendOrderConfirmation(order: MailOrder) {
  const a = order.shippingAddress;
  const shortId = order.id.slice(-8).toUpperCase();
  const rows = order.items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0">${escape(i.title)} × ${i.quantity}</td><td style="text-align:right">${money(i.price * i.quantity)}</td></tr>`
    )
    .join("");
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#1c274c">
      <h2>Thanks for your order, ${escape(a.name)}!</h2>
      <p>Order <strong>#${shortId}</strong> has been received. ${
        order.paymentMethod === "cod"
          ? "You'll pay in cash on delivery."
          : "If you haven't paid yet, open your order and pay by UPI, then enter the UPI transaction ID. We'll ship once the payment is confirmed."
      }</p>
      <table style="width:100%;border-collapse:collapse">${rows}
        <tr><td style="padding-top:12px">Subtotal</td><td style="text-align:right;padding-top:12px">${money(order.subtotal)}</td></tr>
        ${order.taxes ? `<tr><td>${TAX_LABEL}</td><td style="text-align:right">${money(order.taxes)}</td></tr>` : ""}
        <tr><td>Shipping</td><td style="text-align:right">${order.shippingCost ? money(order.shippingCost) : "Free"}</td></tr>
        <tr><td><strong>Total</strong></td><td style="text-align:right"><strong>${money(order.total)}</strong></td></tr>
      </table>
      <p style="margin-top:20px">Shipping to:<br>${escape(a.address)}<br>${escape(a.city)} ${escape(a.zip ?? "")}<br>${escape(a.country)}</p>
      <p><a href="${process.env.NEXTAUTH_URL ?? ""}/orders/${order.id}">View your order</a></p>
    </div>`;
  const message = {
    from: process.env.EMAIL_FROM ?? "no-reply@example.com",
    to: a.email,
    subject: `Order confirmation #${shortId}`,
    html,
  };

  const t = transport();
  if (!t) {
    console.log(`[mail] SMTP not configured. Would send "${message.subject}" to ${message.to}`);
    return;
  }
  try {
    await t.sendMail(message);
  } catch (err) {
    console.error("[mail] Failed to send order confirmation", err);
  }
}
