import { Coach } from "@bookery/database";

declare module "express-session" {
  interface SessionData {
    coach: Coach;
  }
}
