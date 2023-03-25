import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { Auth } from "../providers/auth-provider";
import { MemoryRouter } from "react-router-dom";
import { MockAuthProvider } from "../providers/mock-auth-provider";
import { Signup } from "./signup";
import { faker } from "@faker-js/faker";
import invariant from "tiny-invariant";
import userEvent from "@testing-library/user-event";

function renderSignUpPage(override?: Partial<Auth>) {
  const { container } = render(<Signup />, {
    wrapper: ({ children }) => (
      <MemoryRouter>
        <MockAuthProvider {...override}>{children}</MockAuthProvider>
      </MemoryRouter>
    ),
  });

  const inputs = container.querySelectorAll("input");
  invariant(inputs.length === 5, "Expecting 5 inputs");
  const [
    displayNameInput,
    emailInput,
    passwordInput,
    passwordConfirmInput,
    submitButton,
  ] = inputs;

  return {
    displayNameInput,
    emailInput,
    passwordInput,
    passwordConfirmInput,
    submitButton,
  };
}

test("Renders", async () => {
  renderSignUpPage();
});

test("Sign up form submission", async () => {
  const mockSignUp = vi.fn();
  const {
    displayNameInput,
    emailInput,
    passwordInput,
    passwordConfirmInput,
    submitButton,
  } = renderSignUpPage({
    signUp: mockSignUp,
  });
  const user = userEvent.setup();
  const displayName = faker.name.fullName();
  const email = faker.internet.email();
  const password = faker.internet.password();

  await user.type(displayNameInput, displayName);
  await user.type(emailInput, email);
  await user.type(passwordInput, password);
  await user.type(passwordConfirmInput, password);
  await user.click(submitButton);

  mockSignUp();
});

test("Passwords do not match", async () => {
  const mockSignUp = vi.fn();
  const {
    displayNameInput,
    emailInput,
    passwordInput,
    passwordConfirmInput,
    submitButton,
  } = renderSignUpPage({
    signUp: mockSignUp,
  });
  const user = userEvent.setup();
  const displayName = faker.name.fullName();
  const email = faker.internet.email();
  const password = faker.internet.password();
  const differentPassword = faker.internet.password();

  await user.type(displayNameInput, displayName);
  await user.type(emailInput, email);
  await user.type(passwordInput, password);
  await user.type(passwordConfirmInput, differentPassword);
  await user.click(submitButton);

  const errorMessage = screen.queryByText("Passwords do not match.");

  expect(errorMessage).toBeTruthy();
  expect(mockSignUp).not.toBeCalled();
});

test("Password is too short", async () => {
  const mockSignUp = vi.fn();
  const {
    displayNameInput,
    emailInput,
    passwordInput,
    passwordConfirmInput,
    submitButton,
  } = renderSignUpPage({
    signUp: mockSignUp,
  });
  const user = userEvent.setup();
  const displayName = faker.name.fullName();
  const email = faker.internet.email();
  const password = faker.internet.password(4);

  await user.type(displayNameInput, displayName);
  await user.type(emailInput, email);
  await user.type(passwordInput, password);
  await user.type(passwordConfirmInput, password);
  await user.click(submitButton);

  const errorMessage = screen.queryByText(
    "Password needs to be at least 8 characters long."
  );

  expect(errorMessage).toBeTruthy();
  expect(mockSignUp).not.toBeCalled();
});
