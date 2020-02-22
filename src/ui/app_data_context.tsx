import * as React from "react";
import { AppData } from "../persistence/app_data";

export const AppDataContext = React.createContext<{
  appData: AppData;
  setAppData: (x: AppData) => void;
}>({
  appData: new AppData(),
  setAppData: () => {
    // Empty by default.
  }
});
