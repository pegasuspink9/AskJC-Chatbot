import { v4 as uuidv4 } from "uuid";
import { Request, Response } from "express";
import { prisma } from "../../../prisma/client";

export const getOrCreateUserFromRequest = async (
  req: Request,
  res: Response
) => {
  let deviceId = req.cookies.device_id;

  if (!deviceId) {
    deviceId = uuidv4();
    res.cookie("device_id", deviceId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });
  }

  let user = await prisma.user.findUnique({
    where: { device_id: deviceId },
  });

  if (!user) {
    user = await prisma.user.create({
      data: { device_id: deviceId },
    });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { last_active: new Date() },
  });

  return user;
};
