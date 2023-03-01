import { NextFunction, Request, Response } from "express";

import { PrismaClient } from "@bookery/database";
import bcrypt from "bcrypt";
import { z } from "zod";

const requestBodySchema = z.object({
  displayName: z.string(),
  email: z.string(),
  password: z.string(),
});

async function hashPassword(plaintext: string): Promise<string> {
  return bcrypt.hash(plaintext, 10);
}

export const signupHandler =
  (prisma: PrismaClient) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const bodyParseResult = requestBodySchema.safeParse(req.body);
      if (!bodyParseResult.success) {
        return res.sendStatus(400);
      }
      const coach = await prisma.coach.create({
        data: {
          displayName: bodyParseResult.data.displayName,
          email: bodyParseResult.data.email,
          passwordHash: await hashPassword(bodyParseResult.data.password),
        },
      });
      req.session.coach = coach;
      return res.send({ success: true });
    } catch (e) {
      next(e);
    }
  };
