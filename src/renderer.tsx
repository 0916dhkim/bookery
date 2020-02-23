import * as React from "react";
import * as ReactDOM from "react-dom";
import * as $ from "jquery";
import { Main } from "./ui/main";
import { initializeApplicationMenu } from "./ui/application_menu";
import "semantic-ui-css/semantic.min.css";

const mainRef = React.createRef<Main>();

$(function() {
  ReactDOM.render(<Main ref={mainRef} />, $("#root").get(0));
  initializeApplicationMenu(mainRef);
});
