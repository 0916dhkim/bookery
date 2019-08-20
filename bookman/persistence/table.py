"""SQLite3 interface for Bookman.

This module provides utility functions to interface with SQLite3 database.

Attributes:
    APPLICATION_ID (int): PRAGMA application_id of SQLite3 database.
        This is the application ID of Bookman.

    USER_VERSION (int): PRAGMA user_version of SQLite3 database.
        Database needs migration if and only if there is any difference
        in USER_VERSION between runtime and database file.
"""

import logging
from pathlib import Path
import sqlite3

APPLICATION_ID = 0x22edc87d
USER_VERSION = 1


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
                CREATE TABLE Students
                    (Id UNSIGNED BIG INT PRIMARY KEY,
                    Name TEXT,
                    Note TEXT)
                """)

                cur.execute("""
                CREATE TABLE Books
                    (Id UNSIGNED BIG INT PRIMARY KEY,
                    Isbn TEXT,
                    Title TEXT,
                    Author TEXT)
                """)

                cur.execute("""
                CREATE TABLE Views
                    (Id UNSIGNED BIG INT PRIMARY KEY,
                    StudentId UNSIGNED BIG INT,
                    Timestamp DATETIME,
                    FOREIGN KEY (StudentId) REFERENCES Students(Id))
                """)

                cur.execute("""
                CREATE TABLE Meta
                    (Id UNSIGNED BIG INT PRIMARY KEY,
                    Key TEXT UNIQUE,
                    Value TEXT)
                """)
            finally:
                cur.close()
    except Exception as e:
        logging.error(e)
        # If something goes wrong during database initialization,
        # clean up uninitialized file.
        if path.exists():
            path.unlink()
        raise DatabaseOperationException("Cannot initialize database.")
    finally:
        pass
