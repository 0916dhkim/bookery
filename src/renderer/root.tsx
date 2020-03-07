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
import produce, { castDraft } from "immer";

export interface RootProps {
  request: Request;
}

export interface RootState {
  appData: AppData | null;
  contentViewIndex: number;
  currentFilePath: string | null;
}

type RootAction =
  | { type: "New File" }
  | { type: "Open File"; fileData: AppData; filePath: string }
  | { type: "Save As File"; filePath: string }
  | { type: "Set AppData"; appData: AppData }
  | { type: "Change Content View"; index: number };

function rootReducer(state: RootState, action: RootAction): RootState {
  switch (action.type) {
    case "New File":
      return produce(state, draft => {
        draft.appData = castDraft(new AppData());
      });
    case "Open File":
      return produce(state, draft => {
        draft.appData = castDraft(action.fileData);
        draft.currentFilePath = action.filePath;
      });
    case "Save As File":
      return produce(state, draft => {
        draft.currentFilePath = action.filePath;
      });
    case "Set AppData":
      return produce(state, draft => {
        draft.appData = castDraft(action.appData);
      });
    case "Change Content View":
      return produce(state, draft => {
        draft.contentViewIndex = castDraft(action.index);
      });
  }
}

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

function newFileMenuHandler(dispatch: React.Dispatch<RootAction>): void {
  dispatch({ type: "New File" });
}

async function openFileMenuHandler(
  request: Request,
  dispatch: React.Dispatch<RootAction>
): Promise<void> {
  try {
    const file = await request({ type: "SHOW-OPEN-DIALOG" });
    if (file !== null) {
      const fileContent = fs.readFileSync(file, { encoding: "utf8" });
      const appSerializer = new AppDataSerializer();
      const appDataFromFile = appSerializer.deserialize(fileContent);
      dispatch({
        type: "Open File",
        fileData: appDataFromFile,
        filePath: file
      });
    }
  } catch {
    throw "Failed to handle open file menu event.";
  }
}

async function saveAsFileMenuHandler(
  request: Request,
  dispatch: React.Dispatch<RootAction>,
  state: RootState
): Promise<void> {
  try {
    const file = await request({ type: "SHOW-SAVE-DIALOG" });
    if (file !== null && state.appData !== null) {
      const appDataSerializer = new AppDataSerializer();
      const serializedAppData = appDataSerializer.serialize(state.appData);
      fs.writeFileSync(file, serializedAppData, { encoding: "utf8" });
      dispatch({ type: "Save As File", filePath: file });
    }
  } catch {
    throw "Failed to handle save as menu event.";
  }
}

async function saveFileMenuHandler(
  request: Request,
  dispatch: React.Dispatch<RootAction>,
  state: RootState
): Promise<void> {
  try {
    if (state.appData !== null) {
      if (state.currentFilePath === null) {
        return saveAsFileMenuHandler(request, dispatch, state);
      }
      const appDataSerializer = new AppDataSerializer();
      const serializedAppData = appDataSerializer.serialize(state.appData);
      fs.writeFileSync(state.currentFilePath, serializedAppData, {
        encoding: "utf8"
      });
    }
  } catch {
    throw "Failed to handle save menu event.";
  }
}

export function Root({ request }: RootProps): React.ReactElement<RootProps> {
  const [state, dispatch] = React.useReducer(rootReducer, {
    appData: null,
    contentViewIndex: 0,
    currentFilePath: null
  });
  useEventHandler("ON-NEW-FILE-MENU", newFileMenuHandler.bind(null, dispatch));
  useEventHandler(
    "ON-OPEN-FILE-MENU",
    openFileMenuHandler.bind(null, request, dispatch)
  );
  useEventHandler(
    "ON-SAVE-AS-MENU",
    saveAsFileMenuHandler.bind(null, request, dispatch, state)
  );
  useEventHandler(
    "ON-SAVE-MENU",
    saveFileMenuHandler.bind(null, request, dispatch, state)
  );
  if (!state.appData) {
    return <p>Welcome Screen</p>;
  } else {
    return (
      <Container fluid>
        <SideMenu
          contentViewNames={contentViews.map(contentView => contentView.name)}
          onMenuClick={(menuIndex: number): void => {
            dispatch({ type: "Change Content View", index: menuIndex });
          }}
        />
        <AppDataContext.Provider
          value={{
            appData: state.appData,
            setAppData: (x: AppData): void => {
              dispatch({ type: "Set AppData", appData: x });
            }
          }}
        >
          <RequestContext.Provider
            value={{
              request: request
            }}
          >
            {React.createElement(contentViews[state.contentViewIndex].viewType)}
          </RequestContext.Provider>
        </AppDataContext.Provider>
      </Container>
    );
  }
}
