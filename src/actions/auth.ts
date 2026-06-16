"use server";

import { prisma } from "@/src/lib/prisma";
import crypto from "crypto";

export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return;

  const token = crypto.randomBytes(32).toString("hex");
  const hashed = crypto.createHash("sha256").update(token).digest("hex");

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token: hashed,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });
}
