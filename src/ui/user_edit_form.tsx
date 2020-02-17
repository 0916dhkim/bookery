import * as React from "react";
import { User } from "../persistence/user";

interface UserEditFormState {
  firstNameValue: string;
  lastNameValue: string;
  noteValue?: string;
}

interface UserEditFormProps {
  user: User;
}

export class UserEditForm extends React.Component<
  UserEditFormProps,
  UserEditFormState
> {
  constructor(props: UserEditFormProps) {
    super(props);
    this.state = {
      firstNameValue: this.props.user.firstName,
      lastNameValue: this.props.user.lastName,
      noteValue: this.props.user.note
    };
  }

  resetForm(): void {
    this.setState({
      firstNameValue: this.props.user.firstName,
      lastNameValue: this.props.user.lastName,
      noteValue: this.props.user.note
    });
  }

  render(): React.ReactNode {
    return (
      <form>
        <label>
          Last Name
          <input
            type="text"
            value={this.state.lastNameValue}
            onChange={(event): void => {
              this.setState({ lastNameValue: event.target.value });
            }}
            required
          />
        </label>
        <label>
          First Name
          <input
            type="text"
            value={this.state.firstNameValue}
            onChange={(event): void => {
              this.setState({ firstNameValue: event.target.value });
            }}
            required
          />
        </label>
        <label>
          Note
          <textarea
            defaultValue={this.props.user.note}
            value={this.state.noteValue}
            onChange={(event): void => {
              if (event.target.value.length !== 0) {
                this.setState({ noteValue: event.target.value });
              }
            }}
          />
        </label>
      </form>
    );
  }
}
