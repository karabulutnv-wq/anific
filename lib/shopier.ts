import crypto from "crypto";

const API_KEY = process.env.SHOPIER_API_KEY!;
const API_SECRET = process.env.SHOPIER_API_SECRET!;
const WEBSITE_INDEX = process.env.SHOPIER_WEBSITE_INDEX || "1";

export function generateShopierPayload({
  orderId,
  amount,
  buyerName,
  buyerSurname,
  buyerEmail,
  productName,
}: {
  orderId: string;
  amount: number;
  buyerName: string;
  buyerSurname: string;
  buyerEmail: string;
  productName: string;
}) {
  const random = Math.random().toString(36).substring(2);
  const signature = crypto
    .createHmac("sha256", API_SECRET)
    .update(orderId + amount.toFixed(2) + "TRY" + WEBSITE_INDEX)
    .digest("base64");

  return {
    API_key: API_KEY,
    website_index: WEBSITE_INDEX,
    platform: "0",
    is_in_frame: "0",
    random_nr: random,
    signature,
    order_id: orderId,
    product_name: productName,
    product_type: "1",
    buyer_name: buyerName,
    buyer_surname: buyerSurname,
    buyer_email: buyerEmail,
    buyer_account_age: "0",
    buyer_id_nr: orderId,
    total_order_value: amount.toFixed(2),
    currency: "TRY",
    current_language: "tr",
    callback_url: `${process.env.NEXTAUTH_URL}/api/payment/callback`,
  };
}

export function verifyShopierCallback(params: Record<string, string>) {
  const { signature, order_id, total_order_value } = params;
  const expected = crypto
    .createHmac("sha256", API_SECRET)
    .update(order_id + total_order_value + "TRY" + WEBSITE_INDEX)
    .digest("base64");
  return signature === expected;
}
