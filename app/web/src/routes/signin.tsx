import { ActionFunction, Form, redirect } from "react-router-dom";

import { AuthService } from "../service/auth-service";
import classes from "./signin.module.css";
import { signInInputSchema } from "@bookery/shared";
import { useState } from "react";

export const action = (auth: AuthService): ActionFunction =>
  async ({ request }) => {
    const formData = await request.formData();
    const input = signInInputSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });
    await auth.signIn(input);
    return redirect("/");
  }

export function Signin() {
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");

  return (
    <div className={classes.formWrapper}>
      <Form method="post" className={classes.form}>
        <label className={classes.inputLabel}>Email</label>
        <input
          type="email"
          name="email"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
        />
        <label className={classes.inputLabel}>
          <span>Password</span>
        </label>
        <input
          type="password"
          name="password"
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
        />
        <input className={classes.submitButton} type="submit" value="Log In" />
      </Form>
    </div>
  );
}
