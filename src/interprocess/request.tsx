import { AppData } from "../persistence/app_data";

export type RequestType = "GET-APPDATA" | "SET-APPDATA" | "GET-ISMODIFIED";

export type RequestOption<T extends RequestType> = { type: T } & {
  "GET-APPDATA": {};
  "SET-APPDATA": { data: AppData };
  "GET-ISMODIFIED": {};
}[T];

export type Response<T extends RequestType> = {
  "GET-APPDATA": AppData;
  "SET-APPDATA": void;
  "GET-ISMODIFIED": boolean;
}[T];

export interface SendRequest {
  <T extends RequestType>(options: RequestOption<T>): Promise<Response<T>>;
}

export interface RequestHandler {
  <T extends RequestType>(options: RequestOption<T>): Response<T>;
}
