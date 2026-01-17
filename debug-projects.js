const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const projects = await prisma.project.findMany();
  console.log("--- Projects Debug ---");
  projects.forEach((p) => {
    console.log(`ID: ${p.id}, Name: ${p.name}, AWS ARN: ${p.awsProjectArn || "MISSING"}`);
  });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
