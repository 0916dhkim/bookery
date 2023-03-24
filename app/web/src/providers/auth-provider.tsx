import { ReactNode, createContext, useContext } from "react";
import { SignInInput, SignUpInput } from "@bookery/shared";

import invariant from "tiny-invariant";

export type Auth = {
  signIn: (input: SignInInput) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<void>;
};

const Context = createContext<Auth | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
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

  return (
    <Context.Provider value={{ signIn, signUp }}>{children}</Context.Provider>
  );
}

export function useAuth() {
  const context = useContext(Context);
  invariant(context, "Missing Auth context");
  return context;
}
