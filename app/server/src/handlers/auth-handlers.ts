import { SignInInput, SignUpInput } from "@bookery/shared";

import { AuthService } from "../service/auth-service";
import { Context } from "./handler";

export const signupHandler =
  (auth: AuthService) =>
  async (context: Context<SignUpInput>) => {
    const coach = await auth.signUp(context.body);
    context.setSession(coach);
    return {
      status: 200,
      body: { success: true },
    };
  }

export const signinHandler =
  (auth: AuthService) =>
  async (context: Context<SignInInput>) => {
    try {
      const coach = await auth.signIn(context.body);
      context.setSession(coach);
      return {
        status: 200,
        body: { success: true },
      };
    } catch {
      await context.destroySession();
      return { status: 401, body: { success: false } };
    }
  }
