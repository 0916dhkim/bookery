import { signinHandler, signupHandler } from "./handlers/auth-handlers";

import { HELLO_WORLD } from "@bookery/shared";
import { Service } from "./service/services";
import express from "express";
import session from "express-session";

export function buildApp(service: Service) {
  const app = express();

  app.use(
    session({
      secret: service.env.SESSION_SECRET,
    })
  );
  app.use(express.json());

  app.post("/auth/signup", signupHandler(service.auth));
  app.post("/auth/signin", signinHandler(service.auth));

  app.get("/", (req, res) => {
    res.send(HELLO_WORLD);
  });

  return app;
}
