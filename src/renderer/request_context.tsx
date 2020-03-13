import * as React from "react";
import { Request } from "../common/request";
import { ipcRequest } from "./communication";

export const RequestContext = React.createContext<{
  request: Request;
}>({
  request: ipcRequest
});
