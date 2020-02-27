import * as React from "react";
import { ContentViewProps } from "../content_view";
import { Container, Grid } from "semantic-ui-react";
import { BooksList } from "./books_list";

export class BooksView extends React.Component<ContentViewProps, {}> {
  static readonly title: string = "Books";
  render(): React.ReactNode {
    return (
      <Container fluid>
        Books View
        <Grid divided="vertically">
          <Grid.Column width={8}>
            {/* Books List */}
            <BooksList />
          </Grid.Column>
          <Grid.Column width={8}>{/* Book Edit Form */}</Grid.Column>
        </Grid>
      </Container>
    );
  }
}
