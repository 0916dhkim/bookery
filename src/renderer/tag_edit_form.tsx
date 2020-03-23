import * as React from "react";
import { Segment, Header, Input, Button, Icon } from "semantic-ui-react";
import { FunctionalIterable } from "../common/persistence/functional_iterable";
import { AppDataContext } from "./app_data_context";
import { Tag } from "../common/persistence/tag";
import {
  applyTagToBook,
  applyTagToUser,
  addTag,
  deleteTag
} from "../common/persistence/app_data";

export type TagEditFormProps =
  | { type: "book"; bookId: number }
  | { type: "user"; userId: number };

export function TagEditForm(
  props: TagEditFormProps
): React.ReactElement<TagEditFormProps> {
  const { appData, setAppData } = React.useContext(AppDataContext);
  const [tagInputValue, setTagInputValue] = React.useState<string>("");
  const tags = React.useMemo<FunctionalIterable<Tag>>(() => {
    switch (props.type) {
      case "book": {
        return new FunctionalIterable(appData.bookTags.get(props.bookId) ?? [])
          .map(tagId => appData.tags.get(tagId))
          .filter((tag): tag is Tag => tag !== undefined);
      }
      case "user": {
        return new FunctionalIterable(appData.userTags.get(props.userId) ?? [])
          .map(tagId => appData.tags.get(tagId))
          .filter((tag): tag is Tag => tag !== undefined);
      }
    }
  }, [props, appData.tags, appData.bookTags, appData.userTags]);

  // Clear input field on props change.
  React.useEffect(() => {
    setTagInputValue("");
  }, [props]);

  const validTagName = React.useMemo<boolean>(() => {
    // No empty tag name.
    if (tagInputValue === "") {
      return false;
    }
    // No whitespace.
    if (tagInputValue.match(/\s/)) {
      return false;
    }
    return true;
  }, [tagInputValue]);

  /**
   * Handle add tag button click event.
   */
  function handleAddTagButtonClick(): void {
    let tagToAdd: Tag | undefined = undefined;
    let nextAppData = appData;
    for (const tag of appData.tags.values()) {
      if (tag.name === tagInputValue) {
        // There is an existing tag with the same name.
        tagToAdd = tag;
        break;
      }
    }
    if (!tagToAdd) {
      // There is no existing tag with the same name.
      // Create a new tag.
      [nextAppData, tagToAdd] = addTag(appData, tagInputValue);
    }
    switch (props.type) {
      case "book": {
        setAppData(applyTagToBook(nextAppData, tagToAdd.id, props.bookId));
        break;
      }
      case "user": {
        setAppData(applyTagToUser(nextAppData, tagToAdd.id, props.userId));
        break;
      }
    }
    // Clear input field.
    setTagInputValue("");
  }

  /**
   * Handle delete tag button click event.
   */
  function handleDeleteTagButtonClick(tag: Tag): void {
    setAppData(deleteTag(appData, tag.id)[0]);
  }
  return (
    <Segment.Group>
      <Segment compact tertiary>
        <Header>Tags</Header>
      </Segment>
      <Segment>
        <Input
          data-testid="tag-input"
          fluid
          label={{ icon: "tag", basic: true }}
          value={tagInputValue}
          onChange={(event): void => {
            setTagInputValue(event.target.value);
          }}
          action={
            <Button
              data-testid="add-tag-button"
              disabled={!validTagName}
              positive={!!validTagName}
              onClick={(): void => {
                handleAddTagButtonClick();
              }}
            >
              Add
            </Button>
          }
        />
      </Segment>
      {/* Tag List */}
      <Segment.Group>
        {Array.from(
          tags.map(tag => (
            <Segment key={tag.id.toString()} data-testid="tag-list-element">
              <Icon
                name="x"
                link
                color="red"
                onClick={(): void => {
                  handleDeleteTagButtonClick(tag);
                }}
              />
              {tag.name}
            </Segment>
          ))
        )}
      </Segment.Group>
    </Segment.Group>
  );
}
