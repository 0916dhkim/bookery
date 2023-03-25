import classes from "./signup.module.css";
import { useAuth } from "../providers/auth-provider";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export function Signup() {
  const auth = useAuth();
  const [displayNameInput, setDisplayNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    if (passwordInput !== confirmPasswordInput) {
      setErrorMessage("Passwords do not match.");
      return;
    }
    if (passwordInput.length < 8) {
      setErrorMessage("Password needs to be at least 8 characters long.");
      return;
    }

    try {
      auth.signUp({
        displayName: displayNameInput,
        email: emailInput,
        password: passwordInput,
      });
      navigate("/");
    } catch {
      setErrorMessage("Registration Failed.");
    }
  };

  return (
    <div className={classes.formWrapper}>
      <form onSubmit={handleSubmit} className={classes.form}>
        <label className={classes.inputLabel}>Display Name</label>
        <input
          id="display-name"
          type="text"
          value={displayNameInput}
          onChange={(e) => setDisplayNameInput(e.target.value)}
        />
        <label className={classes.inputLabel}>Email</label>
        <input
          id="email"
          type="email"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
        />
        <label className={classes.inputLabel}>Password</label>
        <input
          id="password"
          type="password"
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
        />
        <label className={classes.inputLabel}>Confirm Password</label>
        <input
          id="confirm-password"
          type="password"
          value={confirmPasswordInput}
          onChange={(e) => setConfirmPasswordInput(e.target.value)}
        />
        <input
          className={classes.submitButton}
          type="submit"
          value="Register"
        />
        {errorMessage && (
          <span className={classes.errorMessage}>{errorMessage}</span>
        )}
      </form>
    </div>
  );
}
