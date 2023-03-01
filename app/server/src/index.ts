import { EnvService } from "./service/env-service";
import { HELLO_WORLD } from "@bookery/shared";
import { PrismaClient } from "@bookery/database";
import express from "express";
import session from "express-session";
import { signinHandler } from "./handlers/signin";
import { signupHandler } from "./handlers/signup";

const env = EnvService();
const app = express();
const prisma = new PrismaClient();

app.use(
  session({
    secret: env.SESSION_SECRET,
  })
);
app.use(express.json());

app.post("/auth/signup", signupHandler(prisma));
app.post("/auth/signin", signinHandler(prisma));

app.get("/", (req, res) => {
  res.send(HELLO_WORLD);
});

app.listen(env.PORT, () => {
  console.log(`Listening to ${env.PORT}...`);
});
