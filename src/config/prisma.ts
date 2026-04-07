import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "./env.js";

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL ?? "",
  max: 5
});

const prismaClient = new PrismaClient({
  adapter
});

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma = globalThis.prisma ?? prismaClient;

if (env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}
