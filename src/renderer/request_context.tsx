import * as React from "react";
import { Request } from "../request";
import { ipcRequest } from "./communication";

export const RequestContext = React.createContext<{
  request: Request;
}>({
  request: ipcRequest
});
