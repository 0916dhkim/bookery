import * as React from "react";
import * as fs from "fs";
import { SideMenu } from "./side_menu";
import { AppData, AppDataSerializer } from "../persistence/app_data";
import { BooksView } from "./books_view/books_view";
import { UsersView } from "./users_view";
import { QueryView } from "./query_view";
import { AppDataContext } from "./app_data_context";
import { ContentViewProps } from "./content_view";
import { Container } from "semantic-ui-react";
import { Request } from "../request";
import { RequestContext } from "./request_context";
import { useEventHandler } from "./communication";

/**
 * Interface for view type array elements.
 */
interface ContentViewElementInterface {
  name: string;
  viewType: React.ComponentType;
}

/**
 * Wrap a component type that requires app data as its props and provide app data context instead.
 * @param T Component type to be wrapped
 */
function wrap(
  T: React.ComponentType<ContentViewProps>
): React.FunctionComponent {
  return (): React.ReactElement => {
    const { appData, setAppData } = React.useContext(AppDataContext);
    const wrappedComponent = React.createElement(T, {
      appData: appData,
      setAppData: setAppData
    });
    return wrappedComponent;
  };
}

/**
 * List of Available View Types.
 */
const contentViews: ContentViewElementInterface[] = [
  {
    name: "Books",
    viewType: BooksView
  },
  {
    name: "Users",
    viewType: UsersView
  },
  {
    name: "Query",
    viewType: wrap(QueryView)
  }
];

function newFileMenuHandler(
  setAppData: React.Dispatch<React.SetStateAction<AppData | null>>
): void {
  setAppData(new AppData());
}

async function openFileMenuHandler(
  request: Request,
  setCurrentFilePath: React.Dispatch<React.SetStateAction<string | null>>,
  setAppData: React.Dispatch<React.SetStateAction<AppData | null>>
): Promise<void> {
  try {
    const file = await request({ type: "SHOW-OPEN-DIALOG" });
    if (file !== null) {
      const fileContent = fs.readFileSync(file, { encoding: "utf8" });
      const appSerializer = new AppDataSerializer();
      const appDataFromFile = appSerializer.deserialize(fileContent);
      setCurrentFilePath(file);
      setAppData(appDataFromFile);
    }
  } catch {
    throw "Failed to handle open file menu event.";
  }
}

async function saveAsFileMenuHandler(
  request: Request,
  appData: AppData | null,
  setCurrentFilePath: React.Dispatch<React.SetStateAction<string | null>>
): Promise<void> {
  try {
    const file = await request({ type: "SHOW-SAVE-DIALOG" });
    if (file !== null && appData !== null) {
      const appDataSerializer = new AppDataSerializer();
      const serializedAppData = appDataSerializer.serialize(appData);
      fs.writeFileSync(file, serializedAppData, { encoding: "utf8" });
      setCurrentFilePath(file);
    }
  } catch {
    throw "Failed to handle save as menu event.";
  }
}

async function saveFileMenuHandler(
  request: Request,
  appData: AppData | null,
  currentFilePath: string | null,
  setCurrentFilePath: React.Dispatch<React.SetStateAction<string | null>>
): Promise<void> {
  try {
    if (appData !== null) {
      if (currentFilePath === null) {
        return saveAsFileMenuHandler(request, appData, setCurrentFilePath);
      }
      const appDataSerializer = new AppDataSerializer();
      const serializedAppData = appDataSerializer.serialize(appData);
      fs.writeFileSync(currentFilePath, serializedAppData, {
        encoding: "utf8"
      });
    }
  } catch {
    throw "Failed to handle save menu event.";
  }
}

export interface RootProps {
  request: Request;
}

export function Root({ request }: RootProps): React.ReactElement<RootProps> {
  const [appData, setAppData] = React.useState<AppData | null>(null);
  const [contentViewIndex, setContentViewIndex] = React.useState<number>(0);
  const [currentFilePath, setCurrentFilePath] = React.useState<string | null>(
    null
  );
  useEventHandler(
    "ON-NEW-FILE-MENU",
    newFileMenuHandler.bind(null, setAppData)
  );
  useEventHandler(
    "ON-OPEN-FILE-MENU",
    openFileMenuHandler.bind(null, request, setCurrentFilePath, setAppData)
  );
  useEventHandler(
    "ON-SAVE-AS-MENU",
    saveAsFileMenuHandler.bind(null, request, appData, setCurrentFilePath)
  );
  useEventHandler(
    "ON-SAVE-MENU",
    saveFileMenuHandler.bind(
      null,
      request,
      appData,
      currentFilePath,
      setCurrentFilePath
    )
  );
  if (!appData) {
    return <p>Welcome Screen</p>;
  } else {
    return (
      <Container fluid>
        <SideMenu
          contentViewNames={contentViews.map(contentView => contentView.name)}
          onMenuClick={setContentViewIndex}
        />
        <AppDataContext.Provider
          value={{
            appData: appData,
            setAppData: setAppData
          }}
        >
          <RequestContext.Provider
            value={{
              request: request
            }}
          >
            {React.createElement(contentViews[contentViewIndex].viewType)}
          </RequestContext.Provider>
        </AppDataContext.Provider>
      </Container>
    );
  }
}
