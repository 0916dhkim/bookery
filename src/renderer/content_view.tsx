import { AppData } from "../common/persistence/app_data";

export interface ContentViewProps {
  appData: AppData;
  setAppData: (appData: AppData) => void;
}
