import { SignInInput, SignUpInput } from "@bookery/shared";

export function AuthService() {
  async function signIn(input: SignInInput) {
    const response = await fetch("/api/auth/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error("Sign in request failed.");
    }
  }

  async function signUp(input: SignUpInput) {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error("Sign up request failed.");
    }
  }

  return {signIn, signUp};
}

export type AuthService = ReturnType<typeof AuthService>;
