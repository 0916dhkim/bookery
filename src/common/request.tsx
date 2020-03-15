export type RequestType =
  | "GET-VERSION"
  | "CLOSE-WINDOW"
  | "SHOW-OPEN-DIALOG"
  | "SHOW-SAVE-DIALOG"
  | "SHOW-OVERRIDE-WARNING"
  | "SHOW-WARNING-MESSAGE"
  | "SHOW-ERROR-MESSAGE";

export type RequestOptions<T extends RequestType> = { type: T } & {
  "GET-VERSION": {};
  "CLOSE-WINDOW": {};
  "SHOW-OPEN-DIALOG": {};
  "SHOW-SAVE-DIALOG": {};
  "SHOW-OVERRIDE-WARNING": {
    message: string;
  };
  "SHOW-WARNING-MESSAGE": {
    message: string;
  };
  "SHOW-ERROR-MESSAGE": {
    title: string;
    message: string;
  };
}[T];

export type WarningMessageOption = "OK" | "Cancel";
export type OverrideWarningOption = "Save" | "Don't Save" | "Cancel";

export type Response<T extends RequestType> = {
  "GET-VERSION": string;
  "CLOSE-WINDOW": void;
  "SHOW-OPEN-DIALOG": string | null;
  "SHOW-SAVE-DIALOG": string | null;
  "SHOW-OVERRIDE-WARNING": OverrideWarningOption;
  "SHOW-WARNING-MESSAGE": WarningMessageOption;
  "SHOW-ERROR-MESSAGE": null;
}[T];

export type Request = {
  <T extends RequestType>(options: RequestOptions<T>): Promise<Response<T>>;
};

export type RequestHandler<T extends RequestType> = (
  options: RequestOptions<T>
) => Promise<Response<T>>;
