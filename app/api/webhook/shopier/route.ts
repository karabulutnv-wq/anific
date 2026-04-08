import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Shopier ürün ID -> plan eşleştirmesi
const PRODUCT_PLAN_MAP: Record<string, { plan: string; duration: number | null }> = {
  "45942522": { plan: "MONTHLY", duration: 30 },
  "45942838": { plan: "THREE_MONTHS", duration: 90 },
  "45942971": { plan: "SIX_MONTHS", duration: 180 },
  "45943020": { plan: "YEARLY", duration: 365 },
  "45943056": { plan: "LIFETIME", duration: null },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const params = new URLSearchParams(body);
    const data: Record<string, string> = {};
    params.forEach((v, k) => { data[k] = v; });

    // Shopier'den gelen sipariş bilgileri
    const buyerEmail = data["buyer_email"] || data["email"];
    const productId = data["product_id"] || data["item_number"];
    const status = data["payment_status"] || data["status"];

    // Sadece başarılı ödemeleri işle
    if (status !== "1" && status !== "success" && status !== "completed") {
      return NextResponse.json({ ok: false, reason: "not_paid" });
    }

    if (!buyerEmail || !productId) {
      return NextResponse.json({ ok: false, reason: "missing_data" });
    }

    const planInfo = PRODUCT_PLAN_MAP[productId];
    if (!planInfo) {
      return NextResponse.json({ ok: false, reason: "unknown_product" });
    }

    // Kullanıcıyı email ile bul
    const user = await prisma.user.findUnique({ where: { email: buyerEmail } });
    if (!user) {
      // Kullanıcı yoksa bekleyen üyelik olarak kaydet
      await prisma.pendingSubscription.create({
        data: {
          email: buyerEmail,
          plan: planInfo.plan as any,
          productId,
        },
      }).catch(() => {});
      return NextResponse.json({ ok: true, note: "user_not_found_pending" });
    }

    const endDate = planInfo.duration
      ? new Date(Date.now() + planInfo.duration * 24 * 60 * 60 * 1000)
      : null;

    await prisma.subscription.upsert({
      where: { userId: user.id },
      update: {
        plan: planInfo.plan as any,
        startDate: new Date(),
        endDate,
        isActive: true,
      },
      create: {
        userId: user.id,
        plan: planInfo.plan as any,
        endDate,
        isActive: true,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, message: "Webhook endpoint active" });
}
