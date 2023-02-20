import { HELLO_WORLD } from "@bookery/shared";
import express from "express";

const PORT = process.env.PORT ?? 5000;
const app = express();

app.get("/", (req, res) => {
  res.send(HELLO_WORLD);
});

app.listen(PORT, () => {
  console.log(`Listening to ${PORT}...`);
});
