import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Signin, action as signinAction } from "./routes/signin";
import { Signup, action as signupAction } from "./routes/signup";

import { AuthService } from "./service/auth-service";
import React from "react";
import ReactDOM from "react-dom/client";
import { Root } from "./routes/root";

const auth = AuthService();

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
  },
  {
    path: "/auth/signin",
    element: <Signin />,
    action: signinAction(auth),
  },
  {
    path: "/auth/signup",
    element: <Signup />,
    action: signupAction(auth),
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
