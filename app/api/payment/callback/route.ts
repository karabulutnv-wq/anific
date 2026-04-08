import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyShopierCallback } from "@/lib/shopier";
import { PLANS, PlanKey } from "@/lib/subscription";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const params: Record<string, string> = {};
  formData.forEach((value, key) => { params[key] = value.toString(); });

  if (!verifyShopierCallback(params))
    return NextResponse.json({ error: "Geçersiz imza" }, { status: 400 });

  if (params.status !== "success")
    return NextResponse.redirect(new URL("/pricing?status=failed", process.env.NEXTAUTH_URL!));

  const [userId, plan] = params.order_id.split("-");
  const planData = PLANS[plan as PlanKey];
  if (!planData) return NextResponse.json({ error: "Geçersiz plan" }, { status: 400 });

  const endDate = planData.duration
    ? new Date(Date.now() + planData.duration * 24 * 60 * 60 * 1000)
    : null;

  await prisma.subscription.upsert({
    where: { userId },
    update: {
      plan: plan as PlanKey,
      startDate: new Date(),
      endDate,
      isActive: true,
      shopierOrderId: params.order_id,
    },
    create: {
      userId,
      plan: plan as PlanKey,
      endDate,
      isActive: true,
      shopierOrderId: params.order_id,
    },
  });

  return NextResponse.redirect(new URL("/pricing?status=success", process.env.NEXTAUTH_URL!));
}
