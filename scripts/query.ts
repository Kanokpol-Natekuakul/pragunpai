import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function run() {
  const pages = await prisma.insurancePage.findMany();
  console.log("Pages:", JSON.stringify(pages, null, 2));
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
