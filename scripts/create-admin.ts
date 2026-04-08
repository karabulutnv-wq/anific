import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];
  const name = process.argv[4] || "Admin";

  if (!email || !password) {
    console.log("Kullanım: npx ts-node scripts/create-admin.ts <email> <şifre> [isim]");
    process.exit(1);
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email },
    update: { role: "ADMIN", password: hashed },
    create: { email, password: hashed, name, role: "ADMIN" },
  });

  await prisma.profile.upsert({
    where: { id: user.id },
    update: {},
    create: { id: user.id, name, userId: user.id },
  }).catch(() => {});

  console.log(`✅ Admin oluşturuldu: ${email}`);
  await prisma.$disconnect();
}

main().catch(console.error);
