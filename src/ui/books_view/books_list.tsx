import * as React from "react";
import { AppDataContext } from "../app_data_context";
import { Menu } from "semantic-ui-react";

export function BooksList(): React.ReactElement {
  const { appData } = React.useContext(AppDataContext);
  return (
    <Menu fluid vertical>
      {Array.from(appData.books.values()).map(book => (
        <Menu.Item key={book.id.toString()}>
          {book.title} by {book.author}
        </Menu.Item>
      ))}
    </Menu>
  );
}
