
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
    const count = await prisma.user.count();
    console.log("USER_COUNT:", count);
}
main().finally(() => prisma.$disconnect());
