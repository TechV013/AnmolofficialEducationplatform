
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function check() {
  try {
    console.log("Attempting to connect to DB...");
    await prisma.$connect();
    console.log("Connection successful!");
    
    const count = await prisma.user.count();
    console.log("User count:", count);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("Connection failed:", message);
  } finally {
    await prisma.$disconnect();
  }
}
check();
