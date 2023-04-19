import { ActionFunction, Form, redirect } from "react-router-dom";

import { AuthService } from "../service/auth-service";
import classes from "./signup.module.css";
import { signUpInputSchema } from "@bookery/shared";
import { useState } from "react";

export const action = (auth: AuthService): ActionFunction =>
  async ({ request }) => {
    const formData = await request.formData();
    const input = signUpInputSchema.parse({
      displayName: formData.get("display-name"),
      email: formData.get("email"),
      password: formData.get("password"),
    });
    await auth.signUp(input);
    return redirect("/");
  }

export function Signup() {
  const [displayNameInput, setDisplayNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");

  return (
    <div className={classes.formWrapper}>
      <Form method="post" className={classes.form}>
        <label className={classes.inputLabel}>Display Name</label>
        <input
          name="display-name"
          type="text"
          value={displayNameInput}
          onChange={(e) => setDisplayNameInput(e.target.value)}
        />
        <label className={classes.inputLabel}>Email</label>
        <input
          name="email"
          type="email"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
        />
        <label className={classes.inputLabel}>Password</label>
        <input
          name="password"
          type="password"
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
        />
        <label className={classes.inputLabel}>Confirm Password</label>
        <input
          name="confirm-password"
          type="password"
          value={confirmPasswordInput}
          onChange={(e) => setConfirmPasswordInput(e.target.value)}
        />
        <input
          className={classes.submitButton}
          type="submit"
          value="Register"
        />
      </Form>
    </div>
  );
}
