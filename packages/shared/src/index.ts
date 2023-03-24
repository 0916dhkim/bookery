import { z } from "zod";

export const HELLO_WORLD = "Hello, World!@#:)";

export const signUpInputSchema = z.object({
  displayName: z.string(),
  email: z.string(),
  password: z.string(),
});
export type SignUpInput = z.infer<typeof signUpInputSchema>;

export const signInInputSchema = z.object({
  email: z.string(),
  password: z.string(),
});
export type SignInInput = z.infer<typeof signInInputSchema>;
