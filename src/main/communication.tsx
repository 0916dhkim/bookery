import { RequestType, Response, RequestHandler } from "../common/request";
import { EventType, EventOptions, EventEmitter } from "../common/event";
import { ipcMain, BrowserWindow, IpcMainInvokeEvent } from "electron";

/**
 * Use ipc to handle requests from renderer process.
 * @param handlers request handlers to be registered
 */
export function registerRequestHandler<T extends RequestType>(
  requestType: T,
  handler: RequestHandler<T>
): void {
  const ipcHandler = (
    event: IpcMainInvokeEvent,
    ...args: any[] // eslint-disable-line @typescript-eslint/no-explicit-any
  ): Promise<Response<T>> => {
    return handler(args[0]);
  };
  ipcMain.handle(requestType, ipcHandler);
}

/**
 * @param browserWindow Renderer to receive events
 * @returns event emitter function
 */
export function createEventEmitter(browserWindow: BrowserWindow): EventEmitter {
  const webContents = browserWindow.webContents;
  async function ret<T extends EventType>(
    options: EventOptions<T>
  ): Promise<void> {
    webContents.send(options.type, options);
  }
  return ret;
}
