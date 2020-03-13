export type EventType =
  | "ON-CLOSE"
  | "ON-NEW-FILE-MENU"
  | "ON-OPEN-FILE-MENU"
  | "ON-SAVE-MENU"
  | "ON-SAVE-AS-MENU";

export type EventOptions<T extends EventType> = { type: T } & {
  "ON-CLOSE": {};
  "ON-NEW-FILE-MENU": {};
  "ON-OPEN-FILE-MENU": {};
  "ON-SAVE-MENU": {};
  "ON-SAVE-AS-MENU": {};
}[T];

export type EventEmitter = {
  <T extends EventType>(options: EventOptions<T>): Promise<void>;
};

export type EventHandler<T extends EventType> = {
  (options: EventOptions<T>): Promise<void>;
};

export type UseEventHandler = {
  <T extends EventType>(eventType: T, handler: EventHandler<T>): void;
};
