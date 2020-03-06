export type RequestType =
  | "SHOW-OPEN-DIALOG"
  | "SHOW-SAVE-DIALOG"
  | "SHOW-OVERRIDE-WARNING"
  | "SHOW-DELETE-WARNING";

export type RequestOptions<T extends RequestType> = { type: T } & {
  "SHOW-OPEN-DIALOG": {};
  "SHOW-SAVE-DIALOG": {};
  "SHOW-OVERRIDE-WARNING": {
    message: string;
  };
  "SHOW-DELETE-WARNING": {
    message: string;
  };
}[T];

export type DeleteWarningOption = "OK" | "Cancel";
export type OverrideWarningOption = "Save" | "Don't Save" | "Cancel";

export type Response<T extends RequestType> = {
  "SHOW-OPEN-DIALOG": string | null;
  "SHOW-SAVE-DIALOG": string | null;
  "SHOW-OVERRIDE-WARNING": OverrideWarningOption;
  "SHOW-DELETE-WARNING": DeleteWarningOption;
}[T];

export type Request = {
  <T extends RequestType>(options: RequestOptions<T>): Promise<Response<T>>;
};

export type RequestHandler<T extends RequestType> = (
  options: RequestOptions<T>
) => Response<T>;
