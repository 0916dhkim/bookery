import * as React from "react";
import { ContentViewProps } from "./content_view";

export class BooksView extends React.Component<ContentViewProps, {}> {
  static readonly title: string = "Books";
  render(): React.ReactNode {
    return (
      <div className="js-books-view">
        Books View
        <ul>
          {Array.from(this.props.appData.books.values()).map(book => (
            <li key={book.id.toString()}>
              <a>
                {book.title} by {book.author}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}
