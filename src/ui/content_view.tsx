import * as React from "react";
import { AppData } from "../persistence/app_data";

export interface Props {
  appData: AppData;
}

export class ContentView extends React.Component<Props, {}> {
  static readonly title: string;
  static readonly sideMenuEntries: Set<typeof ContentView> = new Set();
}
