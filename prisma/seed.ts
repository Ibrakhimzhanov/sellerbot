import { PrismaClient } from "@prisma/client";
import { env } from "../lib/env";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { telegramId: BigInt(env.ADMIN_TELEGRAM_ID) },
    update: { role: "ADMIN", language: "ru" },
    create: {
      telegramId: BigInt(env.ADMIN_TELEGRAM_ID),
      username: "admin",
      firstName: "Admin",
      language: "ru",
      role: "ADMIN"
    }
  });

  const products = [
    {
      nameRu: "Basic Pack",
      nameUz: "Basic Pack",
      descRu: "Набор базовых файлов для быстрого старта.",
      descUz: "Tezkor start uchun oddiy fayllar to'plami.",
      price: 50000,
      category: "New Year Pack",
      fileId: "BASIC_FILE_ID_PLACEHOLDER"
    },
    {
      nameRu: "Pro Pack",
      nameUz: "Pro Pack",
      descRu: "Продвинутый набор премиум-ассетов.",
      descUz: "Premium assetlar to'plami.",
      price: 100000,
      category: "Logo & Branding",
      fileId: "PRO_FILE_ID_PLACEHOLDER"
    }
  ];

  for (const product of products) {
    const exists = await prisma.product.findFirst({
      where: { nameRu: product.nameRu }
    });

    if (!exists) {
      await prisma.product.create({ data: product });
    }
  }
}

main()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
