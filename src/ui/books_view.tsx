import * as React from "react";
import { ContentView } from "./content_view";

export class BooksView extends ContentView {
  static readonly title: string = "Books";
  render(): React.ReactNode {
    return (
      <div className="js-books-view">
        Books View
        <ul>
          {this.props.appData.books.map(book => (
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

ContentView.sideMenuEntries.add(BooksView);