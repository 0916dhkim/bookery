import * as React from "react";
import * as ReactDOM from "react-dom";
import * as $ from "jquery";
import { Root } from "./root";
import "semantic-ui-css/semantic.min.css";
import { ipcRequest, useIpcEventHandler } from "./communication";

$(function() {
  ReactDOM.render(
    <Root request={ipcRequest} useEventHandler={useIpcEventHandler} />,
    $("#root").get(0)
  );
});
