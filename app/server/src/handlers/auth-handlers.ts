import {
  AuthService,
  signInInputSchema,
  signUpInputSchema,
} from "../service/auth-service";
import { NextFunction, Request, Response } from "express";

export const signupHandler =
  (auth: AuthService) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const inputParseResult = signUpInputSchema.safeParse(req.body);
      if (!inputParseResult.success) {
        return res.sendStatus(400);
      }
      const coach = await auth.signUp(inputParseResult.data);
      req.session.coach = coach;
      return res.send({ success: true });
    } catch (e) {
      next(e);
    }
  };

export const signinHandler =
  (auth: AuthService) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const inputParseResult = signInInputSchema.safeParse(req.body);
      if (!inputParseResult.success) {
        return res.sendStatus(400);
      }
      await auth
        .signIn(inputParseResult.data)
        .then((coach) => (req.session.coach = coach))
        .then(() => res.send({ success: true }))
        .catch(() => handleFailedSignIn(req, res));
    } catch (e) {
      next(e);
    }
  };

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
