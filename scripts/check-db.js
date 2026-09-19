
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function check() {
  try {
    console.log("Attempting to connect to DB...");
    await prisma.$connect();
    console.log("Connection successful!");
    const count = await prisma.user.count();
    console.log("User count:", count);
  } catch (e) {
    console.error("Connection failed:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}
check();
