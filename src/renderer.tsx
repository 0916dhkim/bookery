import * as React from "react";
import * as ReactDOM from "react-dom";
import * as $ from "jquery";
import { remote } from "electron";
import { Main } from "./ui/main";
import { applicationMenu } from "./ui/application_menu";

$(function() {
  ReactDOM.render(<Main />, $("#root").get(0));
});

remote.Menu.setApplicationMenu(applicationMenu);
