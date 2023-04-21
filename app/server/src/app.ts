import { HELLO_WORLD, signInInputSchema, signUpInputSchema } from "@bookery/shared";
import { signinHandler, signupHandler } from "./handlers/auth-handlers";

import { Service } from "./service/services";
import express from "express";
import { forExpress } from "./handlers/handler";
import { getCoachHandler } from "./handlers/coach-handler";
import session from "express-session";
import { z } from "zod";

export function buildApp(service: Service) {
  const app = express();

  app.use(
    session({
      secret: service.env.SESSION_SECRET,
    })
  );
  app.use(express.json());

  app.post("/api/auth/signup", forExpress(signupHandler(service.auth), {requestBodySchema: signUpInputSchema}));
  app.post("/api/auth/signin", forExpress(signinHandler(service.auth), {requestBodySchema: signInInputSchema}));
  app.get("/api/coach/:id", forExpress(getCoachHandler(service.coach), {paramsSchema: z.object({id: z.string()})}));

  app.get("/", (req, res) => {
    res.send(HELLO_WORLD);
  });

  return app;
}
