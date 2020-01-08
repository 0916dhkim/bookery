import * as React from "react";
import * as ReactDOM from "react-dom";
import * as $ from "jquery";
import { Main } from "./ui/main";

$(function() {
  ReactDOM.render(<Main />, $("#root").get(0));
});
