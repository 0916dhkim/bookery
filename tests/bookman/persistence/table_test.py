from bookman.persistence import (Book, Member)
from bookman.persistence.table import (new_database, APPLICATION_ID,
                                       USER_VERSION, check_version,
                                       count_books, count_members, select_book,
                                       select_member, query_books,
                                       query_members, insert_book,
                                       insert_member)
import logging
from pathlib import Path
from typing import List
import sqlite3

logger = logging.getLogger(__name__)


def test_new_database(tmp_path: Path):
    logger.debug("Using temporary directory: %s" % tmp_path)
    file_name = "sample.sqlite3"
    file_path = tmp_path / file_name
    new_database(file_path)

    # New database should be created in the designated path.
    assert file_path.exists()

    # Check if the content inside the new database is correct.
    connection = sqlite3.connect(file_path)
    with connection:
        cursor = connection.cursor()
        cursor.row_factory = sqlite3.Row

        cursor.execute("PRAGMA APPLICATION_ID")
        database_application_id = cursor.fetchone()["APPLICATION_ID"]
        logger.debug("database_application_id = %#x" % database_application_id)
        assert database_application_id == APPLICATION_ID

        cursor.execute("PRAGMA USER_VERSION")
        database_user_version = cursor.fetchone()["USER_VERSION"]
        logger.debug("database_user_version = %#x" % database_user_version)
        assert database_user_version == USER_VERSION


def test_new_database_twice(tmp_path: Path):
    logger.debug("Using temporary directory: %s" % tmp_path)
    file_name = "collision.sqlite3"
    file_path = tmp_path / file_name

    # Create the first database.
    new_database(file_path)
    # Attempt to create a database to the same path should fail.
    failed = False
    try:
        new_database(file_path)
    except Exception:
        failed = True
        # Failed attempt should not erase the original file.
        assert file_path.exists()
    if not failed:
        logger.error("Existing file overwritten by new database.")
        assert False


def test_check_version(tmp_path: Path):
    logger.debug("Using temporary directory: %s" % tmp_path)
    file_name = "check_version.sqlite3"
    file_path = tmp_path / file_name

    # Create normal database.
    new_database(file_path)
    # Check version.
    with sqlite3.connect(file_path) as con:
        assert check_version(con)


def test_check_version_empty_db(tmp_path: Path):
    logger.debug("Using temporary directory %s" % tmp_path)
    file_name = "check_version_empty.sqlite3"
    file_path = tmp_path / file_name

    # Create empty database.
    with sqlite3.connect(file_path):
        pass
    # Check version.
    with sqlite3.connect(file_path) as con:
        assert not check_version(con)


def test_count_books_zero(empty_bookman_database: Path):
    con = sqlite3.connect(empty_bookman_database)
    assert 0 == count_books(con)


def test_count_members_zero(empty_bookman_database: Path):
    con = sqlite3.connect(empty_bookman_database)
    assert 0 == count_members(con)


def test_select_book_none(empty_bookman_database: Path):
    con = sqlite3.connect(empty_bookman_database)
    assert None is select_book(con, -1)


def test_select_member_none(empty_bookman_database: Path):
    con = sqlite3.connect(empty_bookman_database)
    assert None is select_member(con, -1)


def test_query_books_count(empty_bookman_database: Path,
                           book_list: List[Book]):
    con = sqlite3.connect(empty_bookman_database)
    with con:
        for b in book_list:
            insert_book(con, b)
    query_result = query_books(con)
    assert sum(1 for b in query_result) == len(book_list)


def test_query_members_count(empty_bookman_database: Path,
                             member_list: List[Member]):
    con = sqlite3.connect(empty_bookman_database)
    with con:
        for m in member_list:
            insert_member(con, m)
    query_result = query_members(con)
    assert sum(1 for m in query_result) == len(member_list)


def test_insert_book(empty_bookman_database: Path):
    con = sqlite3.connect(empty_bookman_database)
    nineteen_eighty_four = Book("Nineteen Eighty Four",
                                "George Orwell",
                                isbn="9780141036144")
    with con:
        nineteen_eighty_four_id = insert_book(con, nineteen_eighty_four)
        logger.debug("ID of the inserted book is %d" % nineteen_eighty_four_id)
    with con:
        selected = select_book(con, nineteen_eighty_four_id)
        assert selected.title == nineteen_eighty_four.title
        assert selected.author == nineteen_eighty_four.author
        assert selected.isbn == nineteen_eighty_four.isbn


def test_insert_member(empty_bookman_database: Path):
    con = sqlite3.connect(empty_bookman_database)
    john = Member("John", "Doe")
    with con:
        john_id = insert_member(con, john)
        logger.debug("ID of the inserted member is %d" % john_id)
    with con:
        selected = select_member(con, john_id)
        assert selected.first_name == john.first_name
        assert selected.last_name == john.last_name
        assert selected.note == john.note
