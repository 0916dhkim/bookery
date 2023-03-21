import classes from "./signin.module.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export function Signin() {
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    const response = await fetch("/api/auth/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: emailInput,
        password: passwordInput,
      }),
    });

    if (!response.ok) {
      setErrorMessage("Login Failed.");
    } else {
      navigate("/");
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
