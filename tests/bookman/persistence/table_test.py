from bookman.persistence import (Book, Member)
from bookman.persistence.table import SCHEMA
import logging
from pathlib import Path
from typing import List
import sqlite3

logger = logging.getLogger(__name__)


class TestBookmanDatabase():
    def test_create_new(self, tmp_path: Path):
        file_name = "sample.sqlite3"
        file_path = tmp_path / file_name

        SCHEMA.create_new(file_path)

        assert file_path.exists()

        connection = sqlite3.connect(file_path)
        cursor = connection.cursor()
        cursor.row_factory = sqlite3.Row
        cursor.execute("PRAGMA APPLICATION_ID")
        assert SCHEMA.application_id == cursor.fetchone()["APPLICATION_ID"]
        cursor.execute("PRAGMA USER_VERSION")
        assert SCHEMA.user_version == cursor.fetchone()["USER_VERSION"]

    def test_create_new_twice(self, tmp_path: Path):
        file_name = "collision.sqlite3"
        file_path = tmp_path / file_name

        SCHEMA.create_new(file_path)

        try:
            SCHEMA.create_new(file_path)
        except FileExistsError:
            # Failed attempt should not erase the original file.
            assert file_path.exists()
            return None
        logger.error("Existing file overwritten by new database.")
        assert False

    def test_check_version(self, tmp_path: Path):
        file_name = "check_version.sqlite3"
        file_path = tmp_path / file_name

        SCHEMA.create_new(file_path)
        assert SCHEMA.check_version(sqlite3.connect(file_path))

    def test_check_version_empty_db(self, tmp_path: Path):
        file_name = "check_version_empty.sqlite3"
        file_path = tmp_path / file_name

        # Create an empty database.
        with sqlite3.connect(file_path):
            pass
        # Check version.
        with sqlite3.connect(file_path) as con:
            assert not SCHEMA.check_version(con)

    def test_insert_book(self, empty_bookman_database: Path):
        con = sqlite3.connect(empty_bookman_database)
        nineteen_eighty_four = Book("Nineteen Eighty Four",
                                    "George Orwell",
                                    isbn="9780141036144")
        with con:
            id = SCHEMA.books_table.insert_obj(con, nineteen_eighty_four)
            logger.debug("ID of the inserted book is %d" % id)
        with con:
            select_result = SCHEMA.books_table.select_obj(con)
            assert len(select_result) == 1
            selected = select_result[0]
            assert selected.title == nineteen_eighty_four.title
            assert selected.author == nineteen_eighty_four.author
            assert selected.isbn == nineteen_eighty_four.isbn

    def test_insert_member(self, empty_bookman_database: Path):
        con = sqlite3.connect(empty_bookman_database)
        john = Member("John", "Doe")
        with con:
            id = SCHEMA.members_table.insert_obj(con, john)
            logger.debug("ID of the inserted member is %d" % id)
        with con:
            select_result = SCHEMA.members_table.select_obj(con)
            assert len(select_result) == 1
            selected = select_result[0]
            assert selected.first_name == john.first_name
            assert selected.last_name == john.last_name
            assert selected.note == john.note

    def test_count_books(self,
                         empty_bookman_database: Path,
                         book_list: List[Book]):
        con = sqlite3.connect(empty_bookman_database)
        for b in book_list:
            SCHEMA.books_table.insert_obj(con, b)
        assert SCHEMA.books_table.count(con) == len(book_list)

    def test_count_books_zero(self, empty_bookman_database: Path):
        con = sqlite3.connect(empty_bookman_database)
        assert 0 == SCHEMA.books_table.count(con)

    def test_count_members(self,
                           empty_bookman_database: Path,
                           member_list: List[Member]):
        con = sqlite3.connect(empty_bookman_database)
        for m in member_list:
            SCHEMA.members_table.insert_obj(con, m)
        assert SCHEMA.members_table.count(con) == len(member_list)

    def test_count_members_zero(self, empty_bookman_database: Path):
        con = sqlite3.connect(empty_bookman_database)
        assert 0 == SCHEMA.members_table.count(con)

    def test_select_books(self,
                          empty_bookman_database: Path,
                          book_list: List[Book]):
        con = sqlite3.connect(empty_bookman_database)
        book_dict = {b.title: b for b in book_list}
        for b in book_list:
            SCHEMA.books_table.insert_obj(con, b)
        select_result = SCHEMA.books_table.select_obj(con)
        for b in select_result:
            assert isinstance(b, Book)
            assert b.title in book_dict
            bdb = book_dict[b.title]
            assert bdb.author == b.author
            assert bdb.isbn == b.isbn
