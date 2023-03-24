import { expect, test, vi } from "vitest";

import { Auth } from "../providers/auth-provider";
import { MemoryRouter } from "react-router-dom";
import { MockAuthProvider } from "../providers/mock-auth-provider";
import { Signin } from "./signin";
import { faker } from "@faker-js/faker";
import invariant from "tiny-invariant";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

function renderSignInPage(override?: Partial<Auth>) {
  const { container } = render(<Signin />, {
    wrapper: ({ children }) => (
      <MemoryRouter>
        <MockAuthProvider {...override}>{children}</MockAuthProvider>
      </MemoryRouter>
    ),
  });

  const emailInput = container.querySelector("input[type=email]");
  invariant(emailInput, "Missing email input");
  const passwordInput = container.querySelector("input[type=password]");
  invariant(passwordInput, "Missing password input");
  const submitButton = container.querySelector("input[type=submit]");
  invariant(submitButton, "Missing submit button");

  return { emailInput, passwordInput, submitButton };
}

test("Renders", async () => {
  renderSignInPage();
});

test("Sign in form submission", async () => {
  const mockSignIn = vi.fn();
  const { emailInput, passwordInput, submitButton } = renderSignInPage({
    signIn: mockSignIn,
  });
  const user = userEvent.setup();
  const email = faker.internet.email();
  const password = faker.internet.password();

  await user.type(emailInput, email);
  await user.type(passwordInput, password);
  await user.click(submitButton);

  expect(mockSignIn).toBeCalledWith({
    email,
    password,
  });
});
