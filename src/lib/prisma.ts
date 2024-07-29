import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

// if we are in production, we want to initialize our prisma client normally
// if we are not in production, we don't want to initialize it multiple times - which is what would happen with nextjs hot reloading
if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
