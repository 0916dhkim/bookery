"""SQLite3 interface for Bookman.

This module provides utility functions to interface with SQLite3 database.
"""

import logging
from pathlib import Path
import sqlite3
from bookman.persistence import (Book, Member, View)
from bookman.common import overrides
from typing import (Any, List, Tuple, Dict)
import enum

logger = logging.getLogger(__name__)


class SqlType(enum.Enum):
    """Data types in SQL."""
    INTEGER = 1
    TEXT = 2
    DATETIME = 3


def escape_sql(x: str) -> str:
    """Escape string to be used in SQL query.

    Replace all double quotes with two double quotes,
    then surround the string with a pair of double quotes.

    Returns:
        Escaped string.
    """
    return "\"%s\"" % x.replace("\"", "\"\"")


class Field():
    """Class representing a field of SQL table."""
    def __init__(self,
                 name: str,
                 field_type: SqlType,
                 not_null: bool = False,
                 primary_key: bool = False,
                 references: Tuple[str, str] = None):
        self.name = name
        """Name of the field."""

        self.field_type = field_type
        """Type of the field."""

        self.not_null = not_null
        """NOT NULL constraint."""

        self.primary_key = primary_key
        """PRIMARY KEY constraint."""

        self.references = references
        """FOREIGN KEY constraint.

        2-tuple of strings.
        references[0] is table name.
        references[1] is field name.
        """
    def schema_str(self) -> str:
        ret: str = f"{escape_sql(self.name)} {self.field_type.name}"
        if self.not_null:
            ret += " NOT NULL"
        if self.primary_key:
            ret += " PRIMARY KEY"
        return ret


class Table():
    """Class representing a SQL table schema."""
    def __init__(self, name: str, fields: List[Field] = None):
        self.name = name
        """Name of the table."""

        if fields is None:
            self.fields = []
            """List of fields."""
        else:
            self.fields = fields

    def schema_str(self) -> str:
        ret: str = f"CREATE TABLE {escape_sql(self.name)} ("
        column_defs = [f.schema_str() for f in self.fields]
        table_constraints: List[str] = []
        for f in self.fields:
            if f.references is not None:
                table_constraints.append((f"FOREIGN KEY "
                                          f"({escape_sql(f.name)}) REFERENCES "
                                          f"{escape_sql(f.references[0])}"
                                          f"({escape_sql(f.references[1])})"))
        ret += ", ".join(column_defs + table_constraints)
        ret += ")"
        return ret

    def row_to_obj(self, row: sqlite3.Row) -> object:
        """Convert SQLite3 row to Python object."""
        return None

    def obj_to_dict(self, obj: object) -> Dict[str, Any]:
        """Convert Python objecto to dict with string keys."""
        return None

    def count(self, connection: sqlite3.Connection) -> int:
        """Number of rows inside the table.

        Args:
            connection: Connection to SQLite3 database.

        Returns:
            Number of rows inside the table.
        """
        cur = connection.cursor()
        try:
            cur.row_factory = sqlite3.Row
            col_name = "A"
            query = (f"SELECT COUNT(*) as {col_name} "
                     f"FROM {escape_sql(self.name)}")
            cur.execute(query)
            ret = cur.fetchone()[col_name]
        except Exception as e:
            logger.exception(e)
            raise DatabaseOperationException(("An exception occurred "
                                              "while counting rows."))
        finally:
            cur.close()

        return ret

    def insert(self, connection: sqlite3.Connection, obj: object) -> int:
        """Insert a Python object into table.

        Args:
            connection: Connection to SQLite3 database.
            obj: Object to be inserted.

        Returns:
            rowid
        """
        d = self.obj_to_dict(obj)
        ks, vs = list(d.keys()), list(d.values())
        query = (f"INSERT INTO "
                 f"{escape_sql(self.name)}({', '.join(map(escape_sql, ks))}) "
                 f"VALUES ({', '.join(['?' for i in ks])})")

        cur = connection.cursor()
        try:
            cur.row_factory = sqlite3.Row
            cur.execute(query, vs)
            ret = cur.lastrowid
        except Exception as e:
            logger.exception(e)
            raise DatabaseOperationException(("An exception occurred "
                                              "while inserting a book."))
        finally:
            cur.close()

        return ret

    def select(self, connection: sqlite3.Connection) -> List[object]:
        field_names = [f.name for f in self.fields]
        query = (f"SELECT {', '.join(map(escape_sql, field_names))} "
                 f"FROM {escape_sql(self.name)}")
        cur = connection.cursor()
        try:
            cur.row_factory = sqlite3.Row
            cur.execute(query)
            ret = [self.row_to_obj(r) for r in cur.fetchall()]
        except Exception as e:
            logger.exception(e)
            raise DatabaseOperationException(("An exception occurred "
                                              "during selection query."))
        finally:
            cur.close()

        return ret


class BooksTable(Table):
    """
    * Id INTEGER PRIMARY KEY
    * Isbn TEXT
    * Title TEXT NOT NULL
    * Author TEXT
    """
    def __init__(self):
        Table.__init__(self, "Books", [
            Field("Id", SqlType.INTEGER, primary_key=True),
            Field("Isbn", SqlType.TEXT),
            Field("Title", SqlType.TEXT, not_null=True),
            Field("Author", SqlType.TEXT),
        ])

    @overrides(Table)
    def row_to_obj(self, row: sqlite3.Row) -> Book:
        return Book(row["Title"], row["Author"], row["Isbn"])

    @overrides(Table)
    def obj_to_dict(self, obj: Book) -> Dict[str, Any]:
        return {
            "Title": obj.title,
            "Author": obj.author,
            "Isbn": obj.isbn,
        }


class MembersTable(Table):
    """
    * Id INTEGER PRIMARY KEY
    * FirstName TEXT NOT NULL
    * LastName TEXT NOT NULL
    * Note TEXT
    """
    def __init__(self):
        Table.__init__(self, "Members", [
            Field("Id", SqlType.INTEGER, primary_key=True),
            Field("FirstName", SqlType.TEXT, not_null=True),
            Field("LastName", SqlType.TEXT, not_null=True),
            Field("Note", SqlType.TEXT),
        ])

    @overrides(Table)
    def row_to_obj(self, row: sqlite3.Row) -> Member:
        return Member(row["FirstName"], row["LastName"], row["Note"])

    @overrides(Table)
    def obj_to_dict(self, obj: Member) -> Dict[str, Any]:
        return {
            "FirstName": obj.first_name,
            "LastName": obj.last_name,
            "Note": obj.note
        }


class ViewsTable(Table):
    """
    * Id INTEGER PRIMARY KEY
    * MemberId INTEGER NOT NULL
    * Timestamp DATETIME
    * FOREIGN KEY (MemberId) REFERENCES Members(Id)
    """
    def __init__(self):
        Table.__init__(self, "Views", [
            Field("Id", SqlType.INTEGER, primary_key=True),
            Field("MemberId",
                  SqlType.INTEGER,
                  not_null=True,
                  references=("Members", "Id")),
            Field("Timestamp", SqlType.DATETIME),
        ])

    @overrides(Table)
    def row_to_obj(self, row: sqlite3.Row) -> View:
        return View(row["MemberId"], row["Timestamp"])

    @overrides(Table)
    def obj_to_dict(self, obj: View) -> Dict[str, Any]:
        return {
            "MemberId": obj.member_id,
            "Timestamp": obj.timestamp
        }


class Database():
    """Class representing a SQL database schema."""
    def __init__(self,
                 application_id: int,
                 user_version: int,
                 tables: List[Table] = None):
        self.application_id = application_id
        """PRAGMA application_id of SQLite3 database.
        This is the application ID of Bookman.
        """

        self.user_version = user_version
        """PRAGMA user_version of SQLite3 database.
        Database needs migration if and only if there is any difference
        in USER_VERSION between runtime and database file.
        """

        if tables is None:
            self.tables = []
        else:
            self.tables = tables

    def schema_str_list(self) -> List[str]:
        """Generate an SQL query to create database with specified schema.

        Returns:
            Sequence of query strings to be executed.
        """
        ret: List[str] = []
        ret.append(f"PRAGMA APPLICATION_ID={self.application_id}")
        ret.append(f"PRAGMA USER_VERSION={self.user_version}")
        ret += [t.schema_str() for t in self.tables]
        return ret

    def create_new(self, path: Path) -> None:
        """Create a new database with empty tables.

        Args:
            path (pathlib.Path): Path to new database. This function raises
                exception if there is a file under this path.

        Raises:
            FileExistsError: There is an existing file under the given path.
        """
        if path.exists():
            raise FileExistsError()
        try:
            # Operation within this with statement will be rolled back in case
            # of exception.
            with sqlite3.connect(path) as con:
                cur = con.cursor()
                cur.row_factory = sqlite3.Row
                try:
                    for q in self.schema_str_list():
                        cur.execute(q)
                finally:
                    cur.close()
        except Exception as e:
            logger.exception(e)
            # If something goes wrong during database initialization,
            # clean up uninitialized file.
            if path.exists():
                path.unlink()
            raise DatabaseOperationException("Cannot initialize database.")

    def check_version(self, connection: sqlite3.Connection):
        """Check if the database has correct application ID and user version

        Args:
            connection (sqlite3.Connection): Connection to SQLite3 database.

        Returns:
            True if database has correct application ID and user version.
            False otherwise.
        """
        cur = connection.cursor()
        cur.row_factory = sqlite3.Row
        try:
            cur.execute("PRAGMA APPLICATION_ID")
            if cur.fetchone()["APPLICATION_ID"] != self.application_id:
                # Application ID mismatch.
                return False

            cur.execute("PRAGMA USER_VERSION")
            if cur.fetchone()["USER_VERSION"] != self.user_version:
                # User version mismatch.
                return False
        except Exception as e:
            logger.exception(e)
            return False

        return True


class BookmanDatabase(Database):
    """Database for Bookman."""
    def __init__(self):
        self.books_table = BooksTable()
        self.members_table = MembersTable()
        self.views_table = ViewsTable()
        Database.__init__(self, 0x22edc87d, 3, [
            self.books_table,
            self.members_table,
            self.views_table
        ])


SCHEMA = BookmanDatabase()


class DatabaseOperationException(Exception):
    """Error while manipulating database file.
        message(str): Error message.
    """
    def __init__(self, message):
        self.message = message

    def __str__(self):
        return self.message
