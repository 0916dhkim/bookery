import { SignInInput, SignUpInput } from "@bookery/shared";

import { PrismaClient } from "@bookery/database";
import bcrypt from "bcrypt";

export function AuthService(prisma: PrismaClient) {
  async function signUp(input: SignUpInput) {
    const coach = await prisma.coach.create({
      data: {
        displayName: input.displayName,
        email: input.email,
        passwordHash: await hashPassword(input.password),
      },
    });

    return coach;
  }

  async function signIn(input: SignInInput) {
    const coach = await prisma.coach.findUnique({
      where: { email: input.email },
    });

    if (coach == null) {
      throw new Error("fail");
    }
    const passwordMatch = await bcrypt.compare(
      input.password,
      coach.passwordHash
    );
    if (!passwordMatch) {
      throw new Error("fail");
    }

    return coach;
  }

  async function hashPassword(plaintext: string): Promise<string> {
    return bcrypt.hash(plaintext, 10);
  }

  return { signUp, signIn };
}

export type AuthService = ReturnType<typeof AuthService>;
