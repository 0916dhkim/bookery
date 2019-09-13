"""Common fixtures for pytest are declared in this module."""
import pytest
from pathlib import Path
from bookman.persistence import Book, Member, create_new_sqlite_database_file
import logging
from typing import List

logger = logging.getLogger(__name__)


@pytest.fixture()
def empty_bookman_database(tmp_path: Path) -> Path:
    """Creates an empty bookman database and returns its path."""

    def file_name(i: int) -> str:
        return "{:d}.sqlite3".format(i)

    logger.debug("Checking file name for the new database.")
    number = 0
    while (tmp_path / file_name(number)).exists():
        number += 1

    file_path = tmp_path / file_name(number)
    logger.debug("File name determined: %s" % file_path)

    logger.debug("Creating new database.")
    create_new_sqlite_database_file(file_path)
    logger.debug("New database created.")

    return file_path


@pytest.fixture()
def book() -> Book:
    """Returns single book object."""
    logger.debug("Returning a book object.")
    return Book(
        title="Harry Potter and the Philosopher's Stone",
        author="Rowling J.K.",
        isbn="9781408855652",
    )


@pytest.fixture()
def book_list() -> List[Book]:
    """Returns a list of book objects."""
    logger.debug("Returning a list of book objects.")
    return [
        Book(title="One Good Deed", author="David Baldacci", isbn="9781538750568"),
        Book(
            title="The Institute: A Novel", author="Stephen King", isbn="9781982110567"
        ),
        Book(
            title="Sapiens: A Brief History of Humankind",
            author="Yuval Noah Harari",
            isbn="9780771038518",
        ),
        Book(
            title="The Oracle: The Jubilean Mysteries Unveiled",
            author="Jonathan Cahn",
            isbn="9781629996295",
        ),
        Book(title="Knife", author="Jo Nesbo", isbn="9780735275348"),
    ]


@pytest.fixture()
def member() -> Member:
    """Returns single member object."""
    logger.debug("Returning a member object.")
    return Member(first_name="John", last_name="Doe", note="Very generic person.")


@pytest.fixture()
def member_list() -> List[Member]:
    """Returns a list of member objects."""
    logger.debug("Returning a list of member objects.")
    return [
        Member(first_name="Tom", last_name="Riddle", note="Lord Voldemort"),
        Member(first_name="James", last_name="Gosling", note="Java person."),
        Member(first_name="Darth", last_name="Vader", note="He's your father."),
        Member(
            first_name="Peter",
            last_name="Parker",
            note="But have your ever seen them in the same room?",
        ),
        Member(first_name="Mary", last_name="Poppins", note="The famous umbrella."),
        Member(first_name="Hermione", last_name="Granger", note="Gryffindor"),
    ]
