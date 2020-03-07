import * as React from "react";
import { ipcRenderer, IpcRendererEvent } from "electron";
import { EventType, EventHandler, UseEventHandler } from "../event";
import { Request, RequestType, RequestOptions, Response } from "../request";

/**
 * React hook to register an event handler.
 * @param handlers an event handler to be registered
 */
function useIpcEventHandlerImplementation<T extends EventType>(
  eventType: T,
  handler: EventHandler<T>
): void {
  React.useEffect(() => {
    const ipcHandler = (
      event: IpcRendererEvent,
      ...args: any[] // eslint-disable-line @typescript-eslint/no-explicit-any
    ): void => {
      handler(args[0]);
    };
    ipcRenderer.on(eventType, ipcHandler);
    return (): void => {
      ipcRenderer.removeListener(eventType, ipcHandler);
    };
  }, [eventType, handler]);
}

async function ipcRequestImplementation<T extends RequestType>(
  options: RequestOptions<T>
): Promise<Response<T>> {
  const response = await ipcRenderer.invoke(options.type, options);
  return response;
}

export const ipcRequest: Request = ipcRequestImplementation;
export const useIpcEventHandler: UseEventHandler = useIpcEventHandlerImplementation;
