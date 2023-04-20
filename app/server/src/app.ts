import { signinHandler, signupHandler } from "./handlers/auth-handlers";

import { HELLO_WORLD } from "@bookery/shared";
import { Service } from "./service/services";
import express from "express";
import { getCoachHandler } from "./handlers/coach-handler";
import session from "express-session";

export function buildApp(service: Service) {
  const app = express();

  app.use(
    session({
      secret: service.env.SESSION_SECRET,
    })
  );
  app.use(express.json());

  app.post("/api/auth/signup", signupHandler(service.auth));
  app.post("/api/auth/signin", signinHandler(service.auth));
  app.get("/api/coach/:id", getCoachHandler(service.coach));

  app.get("/", (req, res) => {
    res.send(HELLO_WORLD);
  });

  return app;
}
