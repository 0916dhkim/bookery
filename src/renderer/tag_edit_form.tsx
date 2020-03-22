import * as React from "react";

export type TagEditFormProps =
  | { type: "book"; bookId: number }
  | { type: "user"; userId: number };

export function TagEditForm(
  props: TagEditFormProps
): React.ReactElement<TagEditFormProps> {
  return <p>TagEditForm</p>;
}
