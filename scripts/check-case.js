
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function check() {
  const email = "instructor.demo@anmolofficial.com"; // Hypothetical email
  const user = await prisma.user.findUnique({ where: { email } });
  console.log("Found user with exact email:", !!user);
  
  const userLower = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  console.log("Found user with lowercase email:", !!userLower);

  await prisma.$disconnect();
}
check();
