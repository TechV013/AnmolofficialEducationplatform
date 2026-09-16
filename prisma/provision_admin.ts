import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function provisionAdmin() {
  const email = process.env.DEMO_ADMIN_EMAIL;
  const password = process.env.DEMO_ADMIN_PASSWORD;
  const dbUrl = process.env.DATABASE_URL;

  if (!email || !password || !dbUrl) {
    console.error("Missing DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD, or DATABASE_URL");
    process.exit(1);
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    if (existingUser.role === "ADMIN") {
      console.log("Admin account already exists for:", email);
      return;
    } else {
      console.error("Conflict: Target user exists with role:", existingUser.role, ". Manual intervention required.");
      process.exit(1);
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      email,
      role: "ADMIN",
      passwordHash: hashedPassword,
      name: "Production Admin"
    }
  });

  console.log("Successfully provisioned Admin account:", email);
}

provisionAdmin().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });