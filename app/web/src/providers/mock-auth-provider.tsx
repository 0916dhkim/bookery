import { Auth, AuthContext } from "./auth-provider";

import { ReactNode } from "react";
import { vi } from "vitest";

type MockAuthProviderProps = {
  children: ReactNode;
} & Partial<Auth>;

export function MockAuthProvider({
  children,
  signIn,
  signUp,
}: MockAuthProviderProps) {
  return (
    <AuthContext.Provider
      value={{
        signIn: signIn ?? vi.fn(),
        signUp: signUp ?? vi.fn(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
