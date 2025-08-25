import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getOrCreateUser = async (user_id?: number) => {
  if (user_id) {
    const user = await prisma.user.findUnique({ where: { id: user_id } });
    if (user) return user;
  }

  return await prisma.user.create({ data: {} });
};
