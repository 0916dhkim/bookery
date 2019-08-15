import sqlite3


def create_tables(con: sqlite3.Connection) -> None:
    """Create empty SQL tables inside database.
    """
    cur = con.cursor()
    try:
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
