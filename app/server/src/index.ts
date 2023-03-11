import { buildApp } from "./app";
import { buildService } from "./service/services";

const service = buildService();
const app = buildApp(service);

app.listen(service.env.PORT, () => {
  console.log(`Listening to ${service.env.PORT}...`);
});
