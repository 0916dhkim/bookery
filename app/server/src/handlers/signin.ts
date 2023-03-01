import { NextFunction, Request, Response } from "express";

import { PrismaClient } from "@bookery/database";
import bcrypt from "bcrypt";
import { z } from "zod";

const requestBodySchema = z.object({
  email: z.string(),
  password: z.string(),
});

async function handleFailedSignIn(req: Request, res: Response) {
  await new Promise((resolve, reject) => {
    req.session.destroy((err) => {
      if (err) {
        reject(err);
      } else {
        resolve(undefined);
      }
    });
  });
  res.sendStatus(401);
}

export const signinHandler =
  (prisma: PrismaClient) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const bodyParseResult = requestBodySchema.safeParse(req.body);
      if (!bodyParseResult.success) {
        return res.sendStatus(400);
      }
      const coach = await prisma.coach.findUnique({
        where: { email: bodyParseResult.data.email },
      });
      if (coach == null) {
        return handleFailedSignIn(req, res);
      }
      const passwordMatch = await bcrypt.compare(
        bodyParseResult.data.password,
        coach.passwordHash
      );
      if (!passwordMatch) {
        return handleFailedSignIn(req, res);
      }
      req.session.coach = coach;
      return res.send({
        success: true,
      });
    } catch (e) {
      next(e);
    }
  };
