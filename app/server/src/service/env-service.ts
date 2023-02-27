import dotenv from "dotenv";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().optional().default("5000"),
  SESSION_SECRET: z.string(),
});

export type EnvService = z.infer<typeof envSchema>;

const loadEnv = () => {
  dotenv.config({ path: "../../.env" });
  return envSchema.parse(process.env);
};
export const EnvService = () => loadEnv();
