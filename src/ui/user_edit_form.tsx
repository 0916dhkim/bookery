import * as React from "react";
import { User } from "../persistence/user";

interface UserEditFormState {
  firstNameValue: string;
  lastNameValue: string;
  noteValue: string;
}

interface UserEditFormProps {
  user: User;
  onUserChange?: (user: User) => void;
}

export class UserEditForm extends React.Component<
  UserEditFormProps,
  UserEditFormState
> {
  /**
   * @returns True if this form's value differs from app data. False otherwise.
   */
  get isModified(): boolean {
    return [
      this.props.user.firstName !== this.state.firstNameValue,
      this.props.user.lastName !== this.state.lastNameValue,
      this.props.user.note
        ? this.props.user.note !== this.state.noteValue
        : this.state.noteValue !== ""
    ].reduce((a, b) => a || b, false);
  }

  constructor(props: UserEditFormProps) {
    super(props);
    this.state = {
      firstNameValue: this.props.user.firstName,
      lastNameValue: this.props.user.lastName,
      noteValue: this.props.user.note ? this.props.user.note : ""
    };
  }

  /**
   * Synchronize this form's fields with the app data.
   */
  resetForm(): void {
    this.setState({
      firstNameValue: this.props.user.firstName,
      lastNameValue: this.props.user.lastName,
      noteValue: this.props.user.note ? this.props.user.note : ""
    });
  }

  /**
   * Commit changes to app data.
   */
  submit(): void {
    const user = this.props.user;
    user.firstName = this.state.firstNameValue;
    user.lastName = this.state.lastNameValue;
    user.note = this.state.noteValue === "" ? undefined : this.state.noteValue;
    if (this.props.onUserChange) {
      this.props.onUserChange(user);
    }
  }

  render(): React.ReactNode {
    return (
      <form
        onSubmit={(event): void => {
          this.submit();
          event.preventDefault();
        }}
      >
        {this.isModified && <p>Modified</p>}
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
            value={this.state.noteValue}
            onChange={(event): void => {
              this.setState({ noteValue: event.target.value });
            }}
          />
        </label>
        <button onClick={this.resetForm.bind(this)}>Reset</button>
        <button type="submit">Apply</button>
      </form>
    );
  }
}
