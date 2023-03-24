import classes from "./signin.module.css";
import { useAuth } from "../providers/auth-provider";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export function Signin() {
  const auth = useAuth();
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    try {
      await auth.signIn({
        email: emailInput,
        password: passwordInput,
      });
      navigate("/");
    } catch {
      setErrorMessage("Login Failed.");
    }
  };

  return (
    <div className={classes.formWrapper}>
      <form onSubmit={handleSubmit} className={classes.form}>
        <label className={classes.inputLabel}>Email</label>
        <input
          type="email"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
        />
        <label className={classes.inputLabel}>
          <span>Password</span>
        </label>
        <input
          type="password"
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
        />
        <input className={classes.submitButton} type="submit" value="Log In" />
        {errorMessage && (
          <span className={classes.errorMessage}>{errorMessage}</span>
        )}
      </form>
    </div>
  );
}
