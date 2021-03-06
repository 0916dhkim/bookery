import * as React from "react";
import * as fs from "fs";
import { SideMenu } from "./side_menu";
import {
  AppData,
  createAppData,
  serializeAppData,
  deserializeAppData
} from "../common/persistence/app_data";
import { BooksView } from "./books_view/books_view";
import { UsersView } from "./users_view";
import { QueryView } from "./query_view";
import { AppDataContext } from "./app_data_context";
import { Container, Segment } from "semantic-ui-react";
import { Request } from "../common/request";
import { RequestContext } from "./request_context";
import { castDraft, produce } from "../common/persistence/immer-initialized";
import { UseEventHandler, EventOptions } from "../common/event";
import { WelcomeView } from "./welcome_view";

export interface RootProps {
  request: Request;
  useEventHandler: UseEventHandler;
}

export interface RootState {
  /**
   * In-memory application data.
   */
  appData: AppData | null;
  /**
   * Persisted application data.
   */
  originalAppData: AppData | null;
  contentViewIndex: number;
  currentFilePath: string | null;
}

type RootAction =
  | { type: "New File" }
  | { type: "Open File"; fileData: AppData; filePath: string }
  | { type: "Save As File"; filePath: string }
  | { type: "Set AppData"; appData: AppData }
  | { type: "Change Content View"; index: number };

function reducer(state: RootState, action: RootAction): RootState {
  switch (action.type) {
    case "New File":
      return produce(state, draft => {
        draft.appData = createAppData();
        draft.originalAppData = null;
        draft.currentFilePath = null;
      });
    case "Open File":
      return produce(state, draft => {
        draft.appData = castDraft(action.fileData);
        draft.originalAppData = castDraft(action.fileData);
        draft.currentFilePath = action.filePath;
      });
    case "Save As File":
      return produce(state, draft => {
        draft.originalAppData = draft.appData;
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
    viewType: QueryView
  }
];

/**
 * Deserialize a file into app data.
 * @param path Path of a file to read app data from.
 * @returns the deserialized app data. `null` if failed.
 */
function getAppDataFromFile(path: string): AppData | null {
  try {
    const fileContent = fs.readFileSync(path, { encoding: "utf8" });
    return deserializeAppData(fileContent);
  } catch {
    return null;
  }
}

async function initializeHandler(
  dispatch: React.Dispatch<RootAction>,
  { processArgs }: EventOptions<"ON-INITIALIZE">
): Promise<void> {
  if (processArgs.length < 2) {
    // No process argument provided.
    return;
  }
  // The first process argument is a path of an app data file.
  // Deserialize the file to initialize this Root component.
  const path = processArgs[1];
  const deserializedData = getAppDataFromFile(path);
  if (deserializedData === null) {
    return;
  }
  dispatch({ type: "Open File", fileData: deserializedData, filePath: path });
  return;
}

/**
 * @param state Root component state.
 * @returns `true` if there is any unsaved changes. `false` otherwise.
 */
function hasUnsavedChanges(state: RootState): boolean {
  if (state.appData === null) {
    if (state.originalAppData !== null) {
      throw "Invalid Root State.";
    }
    return false;
  }

  if (state.originalAppData === null) {
    return true;
  }

  return (
    serializeAppData(state.appData) !== serializeAppData(state.originalAppData)
  );
}

async function saveAsFileMenuHandler(
  request: Request,
  dispatch: React.Dispatch<RootAction>,
  state: RootState
): Promise<void> {
  try {
    const file = await request({ type: "SHOW-SAVE-DIALOG" });
    if (file !== null && state.appData !== null) {
      const serializedAppData = serializeAppData(state.appData);
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
        // First time saving.
        // Equivalent to "save as".
        return saveAsFileMenuHandler(request, dispatch, state);
      }
      const serializedAppData = serializeAppData(state.appData);
      fs.writeFileSync(state.currentFilePath, serializedAppData, {
        encoding: "utf8"
      });
      dispatch({ type: "Save As File", filePath: state.currentFilePath });
    }
  } catch {
    throw "Failed to handle save menu event.";
  }
}

/**
 * Resolves to `true` when
 * 1. There is no unsaved changes OR
 * 2. User saves app data OR
 * 3. User consents to discard unsaved changes.
 *
 * Resolves to `false` when
 * 1. User wants to abort the override.
 *
 * Rejects otherwise.
 */
async function ensureSafeToOverrideAppData(
  request: Request,
  dispatch: React.Dispatch<RootAction>,
  state: RootState
): Promise<boolean> {
  if (!hasUnsavedChanges(state)) {
    // No unsaved change.
    return true;
  }
  // Unsaved changes exist.
  const warningResponse = await request({
    type: "SHOW-OVERRIDE-WARNING",
    message: `Do you want to save changes to ${state.currentFilePath ??
      "a file"}?`
  });
  switch (warningResponse) {
    case "Cancel": {
      // User wants to stop the overriding operation.
      // Unsafe to override app data.
      return false;
    }
    case "Don't Save": {
      // User consent given to override unsaved changes.
      // Safe to override app data.
      return true;
    }
    case "Save": {
      // Save changes and continue.
      try {
        await saveFileMenuHandler(request, dispatch, state);
      } catch {
        // Failed to save.
        // Unsafe to override app data.
        return false;
      }
      // Successfully saved.
      // Safe to override app data.
      return true;
    }
  }
}

async function closeHandler(
  request: Request,
  dispatch: React.Dispatch<RootAction>,
  state: RootState
): Promise<void> {
  try {
    if (await ensureSafeToOverrideAppData(request, dispatch, state)) {
      request({ type: "CLOSE-WINDOW" });
    }
  } catch {
    throw "Failed to handle close event.";
  }
}

async function newFileMenuHandler(
  request: Request,
  state: RootState,
  dispatch: React.Dispatch<RootAction>
): Promise<void> {
  try {
    if (await ensureSafeToOverrideAppData(request, dispatch, state)) {
      dispatch({ type: "New File" });
    }
  } catch {
    throw "Failed to handle new file event.";
  }
}

async function openFileMenuHandler(
  request: Request,
  dispatch: React.Dispatch<RootAction>,
  state: RootState
): Promise<void> {
  try {
    if (await ensureSafeToOverrideAppData(request, dispatch, state)) {
      const file = await request({ type: "SHOW-OPEN-DIALOG" });
      if (file !== null) {
        const appDataFromFile = getAppDataFromFile(file);
        if (appDataFromFile === null) {
          throw "Failed to deserialize file.";
        }
        dispatch({
          type: "Open File",
          fileData: appDataFromFile,
          filePath: file
        });
      }
    }
  } catch {
    throw "Failed to handle open file menu event.";
  }
}

export function Root({
  request,
  useEventHandler
}: RootProps): React.ReactElement<RootProps> {
  const [state, dispatch] = React.useReducer(reducer, {
    appData: null,
    originalAppData: null,
    contentViewIndex: 0,
    currentFilePath: null
  });

  // Request for initialization event from main process.
  React.useEffect(() => {
    request({ type: "INVOKE-INITIALIZATION" });
  }, [request]);

  useEventHandler("ON-INITIALIZE", initializeHandler.bind(null, dispatch));
  useEventHandler(
    "ON-CLOSE",
    closeHandler.bind(null, request, dispatch, state)
  );
  useEventHandler(
    "ON-NEW-FILE-MENU",
    newFileMenuHandler.bind(null, request, state, dispatch)
  );
  useEventHandler(
    "ON-OPEN-FILE-MENU",
    openFileMenuHandler.bind(null, request, dispatch, state)
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
    return <WelcomeView request={request} />;
  } else {
    return (
      <Container fluid>
        <SideMenu
          contentViewNames={contentViews.map(contentView => contentView.name)}
          contentViewIndex={state.contentViewIndex}
          onMenuClick={(menuIndex: number): void => {
            dispatch({ type: "Change Content View", index: menuIndex });
          }}
        />

        <Segment basic attached="bottom">
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
              {React.createElement(
                contentViews[state.contentViewIndex].viewType
              )}
            </RequestContext.Provider>
          </AppDataContext.Provider>
        </Segment>
      </Container>
    );
  }
}
