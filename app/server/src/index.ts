import { EnvService } from "./service/env-service";
import { HELLO_WORLD } from "@bookery/shared";
import express from "express";
import session from "express-session";

const env = EnvService();
const app = express();

app.use(
  session({
    secret: env.SESSION_SECRET,
  })
);

app.get("/", (req, res) => {
  res.send(HELLO_WORLD);
});

app.listen(env.PORT, () => {
  console.log(`Listening to ${env.PORT}...`);
});
