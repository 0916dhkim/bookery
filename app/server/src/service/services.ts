import { AuthService } from "./auth-service";
import { EnvService } from "./env-service";
import { PrismaClient } from "@bookery/database";

export type Service = {
  env: EnvService;
  auth: AuthService;
};

export function buildService(): Service {
  const prisma = new PrismaClient();

  return {
    env: EnvService(),
    auth: AuthService(prisma),
  };
}
