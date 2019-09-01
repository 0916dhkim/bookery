"""SQLite3 interface for Bookman.

This module provides utility functions to interface with SQLite3 database.
"""

import logging
from pathlib import Path
import sqlite3
from bookman.persistence import (Book, Member)
from typing import List

logger = logging.getLogger(__name__)

APPLICATION_ID: int = 0x22edc87d
"""PRAGMA application_id of SQLite3 database.
This is the application ID of Bookman.
"""

USER_VERSION: int = 3
"""PRAGMA user_version of SQLite3 database.
Database needs migration if and only if there is any difference
in USER_VERSION between runtime and database file.
"""


class DatabaseOperationException(Exception):
    """Error while manipulating database file.
        message(str): Error message.
    """
    def __init__(self, message):
        self.message = message

    def __str__(self):
        return self.message


class ApplicationIdMismatch(Exception):
    """Application ID of connected database is different from Bookman's

    Attributes:
        application_id (int): PRAGMA application_id of connected
            SQLite3 database.
    """
    def __init__(self, application_id):
        self.application_id = application_id

    def __str__(self):
        return ("Application ID of the database file (%x) "
                "is different from "
                "application ID of Bookman "
                "(%x).") % (self.application_id, APPLICATION_ID)


class UserVersionMismatch(Exception):
    """User version of connected database is different from Bookman's

    Attributes:
        user_version (int): PRAGMA user_version of connected
            SQLite3 database.
    """
    def __init__(self, user_version):
        self.user_version = user_version

    def __str__(self):
        return ("User version of the database file (%#x) "
                "is different from "
                "user version of runtime "
                "(%#x).") % (self.application_id, APPLICATION_ID)


def new_database(path: Path) -> None:
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
                # Set metadata.
                cur.execute("PRAGMA APPLICATION_ID = %#x" % APPLICATION_ID)
                cur.execute("PRAGMA USER_VERSION = %#x" % USER_VERSION)

                # Create new empty tables.
                cur.execute("""
                CREATE TABLE Members
                    (Id INTEGER PRIMARY KEY,
                    FirstName TEXT NOT NULL,
                    LastName TEXT NOT NULL,
                    Note TEXT)
                """)

                cur.execute("""
                CREATE TABLE Books
                    (Id INTEGER PRIMARY KEY,
                    Isbn TEXT,
                    Title TEXT NOT NULL,
                    Author TEXT)
                """)

                cur.execute("""
                CREATE TABLE Views
                    (Id INTEGER PRIMARY KEY,
                    MemberId INTEGER,
                    Timestamp DATETIME,
                    FOREIGN KEY (MemberId) REFERENCES Members(Id))
                """)
            finally:
                cur.close()
    except Exception as e:
        logger.exception(e)
        # If something goes wrong during database initialization,
        # clean up uninitialized file.
        if path.exists():
            path.unlink()
        raise DatabaseOperationException("Cannot initialize database.")


def check_version(con: sqlite3.Connection) -> bool:
    """Check if the database has correct application ID and user version

    Args:
        con (sqlite3.Connection): Connection to SQLite3 database.

    Returns:
        True if database has correct application ID and user version.
        False otherwise.
    """
    cur = con.cursor()
    cur.row_factory = sqlite3.Row
    try:
        cur.execute("PRAGMA APPLICATION_ID")
        if cur.fetchone()["APPLICATION_ID"] != APPLICATION_ID:
            # Application ID mismatch.
            return False

        cur.execute("PRAGMA USER_VERSION")
        if cur.fetchone()["USER_VERSION"] != USER_VERSION:
            # User version mismatch.
            return False
    except Exception as e:
        logger.exception(e)
        return False

    return True


def count_books(con: sqlite3.Connection) -> int:
    """Count the total number of books in the database.

    Args:
        con (sqlite3.Connection): Connection to SQLite3 database.

    Returns:
        Number of books in the database.
    """
    cur = con.cursor()
    try:
        cur.row_factory = sqlite3.Row
        col_name = "A"
        query = "SELECT COUNT(*) AS %s FROM Books" % col_name
        cur.execute(query)
        ret = cur.fetchone()[col_name]
    finally:
        cur.close()
    return ret


def count_members(con: sqlite3.Connection) -> int:
    """Count the total number of members in the database.

    Args:
        con (sqlite3.Connection): Connection to SQLite3 database.

    Returns:
        Number of members in the database.
    """
    cur = con.cursor()
    try:
        cur.row_factory = sqlite3.Row
        col_name = "A"
        query = "SELECT COUNT(*) AS %s FROM Members" % col_name
        cur.execute(query)
        ret = cur.fetchone()[col_name]
    finally:
        cur.close()
    return ret


def select_book(con: sqlite3.Connection, id: int) -> Book:
    """Select a book by id

    Args:
        con (sqlite3.Connection): Connection to SQLite3 database.
        id (int): ID of the book.

    Returns:
        None if there is no matching book.
        A Book object if there is a book with the given ID.
    """
    cur = con.cursor()
    try:
        cur.row_factory = sqlite3.Row
        query = "SELECT Id, Isbn, Title, Author FROM Books WHERE Id = ?"
        cur.execute(query, [id])
        query_result = cur.fetchone()
    except Exception as e:
        logger.exception(e)
        raise DatabaseOperationException(("An exception occurred "
                                          "while selecting a book."))
    finally:
        cur.close()

    if query_result is None:
        return None
    else:
        return Book(query_result["Title"],
                    author=query_result["Author"],
                    isbn=query_result["Isbn"])


def select_member(con: sqlite3.Connection, id: int) -> Member:
    """Select a member by id

    Args:
        con (sqlite3.Connection): Connection to SQLite3 database.
        id (int): ID of the member.

    Returns:
        None if there is no matching member.
        A Member object if there is a member with the given ID.
    """
    cur = con.cursor()
    try:
        cur.row_factory = sqlite3.Row
        query = ("SELECT Id, FirstName, LastName, Note "
                 "FROM Members WHERE Id = ?")
        cur.execute(query, [id])
        query_result = cur.fetchone()
    except Exception as e:
        logger.exception(e)
        raise DatabaseOperationException(("An exception occurred "
                                          "while selecting a member."))
    finally:
        cur.close()

    if query_result is None:
        return None
    else:
        return Member(query_result["FirstName"], query_result["LastName"],
                      query_result["Note"])


def query_books(con: sqlite3.Connection) -> List[Book]:
    """Query books.

    Args:
        con (sqlite3.Connection): Connection to SQLite3 database.

    Returns:
        List of book objects.
    """
    ret: List[Book] = []
    query = "SELECT * FROM Books"
    cur = con.cursor()
    try:
        cur.execute(query)
        cur.row_factory = sqlite3.Row
        for row in cur.fetchall():
            ret.append(Book(row["Title"], row["Author"], isbn=row["Isbn"]))
    except Exception as e:
        logger.exception(e)
    finally:
        cur.close()
    return ret


def query_members(con: sqlite3.Connection) -> List[Member]:
    """Query members.

    Args:
        con (sqlite3.Connection): Connection to SQLite3 database.

    Returns:
        List of member objects.
    """
    ret: List[Member] = []
    query = "SELECT * FROM Members"
    cur = con.cursor()
    try:
        cur.execute(query)
        cur.row_factory = sqlite3.Row
        for row in cur.fetchall():
            ret.append(
                Member(row["FirstName"], row["LastName"], note=row["Note"]))
    except Exception as e:
        logger.exception(e)
    finally:
        cur.close()
    return ret


def insert_book(con: sqlite3.Connection, book: Book) -> int:
    """Insert a book into database.

    Args:
        con (sqlite3.Connection): Connection to SQLite3 database.
        book (Book): A Book object to insert.

    Returns:
        ID of the inserted book.
    """
    cur = con.cursor()
    try:
        cur.row_factory = sqlite3.Row
        query = "INSERT INTO Books (Isbn, Title, Author) VALUES (?, ?, ?)"
        cur.execute(query, [book.isbn, book.title, book.author])
        ret = cur.lastrowid
    except Exception as e:
        logger.exception(e)
        raise DatabaseOperationException(("An exception occurred "
                                          "while inserting a book."))
    finally:
        cur.close()

    return ret


def insert_member(con: sqlite3.Connection, member: Member) -> int:
    """Insert a member into database.

    Args:
        con (sqlite3.Connection): Connection to SQLite3 database.
        member (Member): A Member object to insert.

    Returns:
        ID of the inserted member.
    """
    cur = con.cursor()
    try:
        cur.row_factory = sqlite3.Row
        query = ("INSERT INTO Members (FirstName, LastName, Note) "
                 "VALUES (?, ?, ?)")
        cur.execute(query, [member.first_name, member.last_name, member.note])
        ret = cur.lastrowid
    except Exception as e:
        logger.exception(e)
        raise DatabaseOperationException(("An exception occurred "
                                          "while inserting a member."))
    finally:
        cur.close()

    return ret
