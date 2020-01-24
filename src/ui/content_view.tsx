import * as React from "react";
import { Type } from "../type";
import { BooksView } from "./books_view";
import { UsersView } from "./users_view";

export enum ContentViewType {
  BOOKS_VIEW = "Books",
  USERS_VIEW = "Users"
}

export function nameToType(typeName: ContentViewType): Type<React.Component> {
  switch (typeName) {
    case ContentViewType.BOOKS_VIEW:
      return BooksView;
    case ContentViewType.USERS_VIEW:
      return UsersView;
  }
}
