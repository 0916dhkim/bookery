import * as React from "react";
import { AppData, createAppData } from "../common/persistence/app_data";

export const AppDataContext = React.createContext<{
  appData: AppData;
  setAppData: (x: AppData) => void;
}>({
  appData: createAppData(),
  setAppData: () => {
    // Empty by default.
  }
});
