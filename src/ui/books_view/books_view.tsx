import * as React from "react";
import { Container, Grid, Input } from "semantic-ui-react";
import { BooksList } from "./books_list";

export interface BooksViewProps {
  children?: React.ReactNode;
}

export function BooksView(): React.ReactElement<BooksViewProps> {
  const [filterValue, setFilterValue] = React.useState<string>("");
  return (
    <Container fluid>
      Books View
      <Input
        type="text"
        icon="search"
        value={filterValue}
        onChange={(event): void => {
          setFilterValue(event.target.value);
        }}
        style={{ flexGrow: 1 }}
      />
      <Grid divided="vertically">
        <Grid.Column width={8}>
          {/* Books List */}
          <BooksList filterQuery={filterValue} />
        </Grid.Column>
        <Grid.Column width={8}>{/* Book Edit Form */}</Grid.Column>
      </Grid>
    </Container>
  );
}
