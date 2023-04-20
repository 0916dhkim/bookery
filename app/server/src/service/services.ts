import { AuthService } from "./auth-service";
import { CoachService } from "./coach-service";
import { EnvService } from "./env-service";
import { PrismaClient } from "@bookery/database";

export type Service = {
  env: EnvService;
  auth: AuthService;
  coach: CoachService;
};

export function buildService(): Service {
  const prisma = new PrismaClient();

  return {
    env: EnvService(),
    auth: AuthService(prisma),
    coach: CoachService(prisma),
  };
}
