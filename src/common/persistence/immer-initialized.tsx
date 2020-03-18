/**
 * From version 6, some `immer` features needs to be
 * enabled at the start of each application.
 *
 * Importing this module instead of directly importing `immer` package itself
 * ensures that opt-in features are enabled before using `immer`.
 */
import { enableMapSet } from "immer";

// Enable opt-in features.
enableMapSet();

// Re-export `immer`.
export * from "immer";
