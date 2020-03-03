import { AppData } from "../persistence/app_data";

export type MainRequestType = "GET-APPDATA" | "SET-APPDATA" | "GET-ISMODIFIED";
export type RendererRequestType = never;
export type RequestType = MainRequestType | RendererRequestType;

export type RequestOptions<T extends RequestType> = {
  "GET-APPDATA": {};
  "SET-APPDATA": { value: AppData };
  "GET-ISMODIFIED": {};
}[T];

export type Response<T extends RequestType> = {
  "GET-APPDATA": AppData;
  "SET-APPDATA": void;
  "GET-ISMODIFIED": boolean;
}[T];

export type Request<T extends RequestType> = (
  options: RequestOptions<T>
) => Promise<Response<T>>;

export type HandleRequest<T extends RequestType> = (
  options: RequestOptions<T>
) => Response<T>;

export type MainRequestFunctionMap = {
  [T in MainRequestType]: Request<T>;
};

export type RegisterMainRequestHandlers = (
  handlers: {
    [T in MainRequestType]: HandleRequest<T>;
  }
) => void;

export type RendererRequestFunctionMap = {
  [T in RendererRequestType]: Request<T>;
};

export type RegisterRendererRequestHandlers = (
  handlers: {
    [T in RendererRequestType]: HandleRequest<T>;
  }
) => void;
