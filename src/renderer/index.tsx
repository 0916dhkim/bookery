import * as React from "react";
import * as ReactDOM from "react-dom";
import * as $ from "jquery";
import { Root } from "./root";
import { initializeApplicationMenu } from "../main/application_menu";
import "semantic-ui-css/semantic.min.css";

const rootRef = React.createRef<Root>();

$(function() {
  ReactDOM.render(<Root ref={rootRef} />, $("#root").get(0));
  initializeApplicationMenu(rootRef);
});
