import { describe, it, afterEach } from "mocha";
import { render, cleanup, within } from "@testing-library/react";
import { BooksView } from "../../src/renderer/books_view";
import { DeleteBookDialogOption } from "../../src/renderer/books_view/delete_book_dialog";
import { ModifiedDialogOption } from "../../src/renderer/modified_dialog";
import * as React from "react";
import { AppDataContext } from "../../src/renderer/app_data_context";
import { AppData } from "../../src/persistence/app_data";
import moment = require("moment");
import userEvent from "@testing-library/user-event";
import * as sinon from "sinon";
import * as assert from "assert";

const sandbox = sinon.createSandbox();

afterEach(function() {
  sandbox.restore();
  cleanup();
});

describe("BooksView", function() {
  describe("Delete Button", function() {
    it("Deleting A Book Should Cascade", async function() {
      let x = new AppData();
      const bookA = x.generateBook("ABC", "noname");
      x = x.setBook(bookA);
      const bookB = x.generateBook("DEF", "noname");
      x = x.setBook(bookB);
      const userDan = x.generateUser("Smith", "Dan");
      x = x.setUser(userDan);
      const userFrank = x.generateUser("Kennedy", "Frank");
      x = x.setUser(userFrank);
      x = x.setView(
        x.generateView(userDan.id, bookA.id, moment.utc("20100517").valueOf())
      );
      x = x.setView(
        x.generateView(userFrank.id, bookA.id, moment.utc("20111203").valueOf())
      );
      x = x.setView(
        x.generateView(userFrank.id, bookB.id, moment.utc("20120109").valueOf())
      );

      const fakeSetAppData = sandbox.stub<[AppData], void>();
      const { getByTestId } = render(
        <AppDataContext.Provider
          value={{
            appData: x,
            setAppData: fakeSetAppData
          }}
        >
          <BooksView
            showDeleteBookDialogSync={(): DeleteBookDialogOption =>
              DeleteBookDialogOption.OK
            }
            showModifiedDialogSync={(): ModifiedDialogOption =>
              ModifiedDialogOption.SAVE
            }
          />
        </AppDataContext.Provider>
      );

      userEvent.click(within(getByTestId("suggestions-list")).getByText(/DEF/));
      userEvent.click(getByTestId("book-delete-button"));

      assert(fakeSetAppData.calledOnce);
      const nextAppData = fakeSetAppData.firstCall.args[0];
      assert.strictEqual(nextAppData.books.size, 1, "One book deleted.");
      assert.strictEqual(nextAppData.users.size, 2, "No user deleted.");
      assert.strictEqual(
        nextAppData.views.size,
        2,
        "One out of three views is deleted."
      );
    });
  });
});
