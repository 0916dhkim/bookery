import * as React from "react";
import { Container, Grid } from "semantic-ui-react";
import { BooksList } from "./books_list";

export interface BooksViewProps {
  children?: React.ReactNode;
}

export function BooksView(): React.ReactElement<BooksViewProps> {
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
