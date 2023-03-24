import { RouterProvider, createBrowserRouter } from "react-router-dom";

import { AuthProvider } from "./providers/auth-provider";
import React from "react";
import ReactDOM from "react-dom/client";
import { Root } from "./routes/root";
import { Signin } from "./routes/signin";
import { Signup } from "./routes/signup";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
  },
  {
    path: "/auth/signin",
    element: <Signin />,
  },
  {
    path: "/auth/signup",
    element: <Signup />,
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
