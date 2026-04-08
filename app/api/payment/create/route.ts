import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateShopierPayload } from "@/lib/shopier";
import { PLANS, PlanKey } from "@/lib/subscription";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });

  const { plan } = await req.json();
  if (!PLANS[plan as PlanKey])
    return NextResponse.json({ error: "Geçersiz plan" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });

  const planData = PLANS[plan as PlanKey];
  const orderId = `${user.id}-${plan}-${Date.now()}`;
  const nameParts = user.name.split(" ");

  const payload = generateShopierPayload({
    orderId,
    amount: planData.price,
    buyerName: nameParts[0],
    buyerSurname: nameParts.slice(1).join(" ") || "-",
    buyerEmail: user.email,
    productName: `ANIFIC ${planData.name} Üyelik`,
  });

  return NextResponse.json({ payload, shopierUrl: "https://www.shopier.com/ShowProduct/api_pay4.php" });
}
