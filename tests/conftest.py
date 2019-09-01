"""Common fixtures for pytest are declared in this module."""
import pytest
from pathlib import Path
from bookman.persistence import (Book, Member)
from bookman.persistence.table import new_database
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
    new_database(file_path)
    logger.debug("New database created.")

    return file_path


@pytest.fixture()
def book() -> Book:
    """Returns single book object."""
    logger.debug("Returning a book object.")
    return Book("Harry Potter and the Philosopher's Stone",
                "Rowling J.K.",
                isbn="9781408855652")


@pytest.fixture()
def book_list() -> List[Book]:
    """Returns a list of book objects."""
    logger.debug("Returning a list of book objects.")
    return [
        Book("One Good Deed", "David Baldacci", isbn="9781538750568"),
        Book("The Institute: A Novel", "Stephen King", isbn="9781982110567"),
        Book("Sapiens: A Brief History of Humankind",
             "Yuval Noah Harari",
             isbn="9780771038518"),
        Book("The Oracle: The Jubilean Mysteries Unveiled",
             "Jonathan Cahn",
             isbn="9781629996295"),
        Book("Knife", "Jo Nesbo", isbn="9780735275348"),
    ]


@pytest.fixture()
def member() -> Member:
    """Returns single member object."""
    logger.debug("Returning a member object.")
    return Member("John", "Doe", note="Very generic person.")


@pytest.fixture()
def member_list() -> List[Member]:
    """Returns a list of member objects."""
    logger.debug("Returning a list of member objects.")
    return [
        Member("Tom", "Riddle", note="Lord Voldemort"),
        Member("James", "Gosling", note="Java person."),
        Member("Darth", "Vader", note="He's your father."),
        Member("Peter",
               "Parker",
               note="But have your ever seen them in the same room?"),
        Member("Mary", "Poppins", note="The famous umbrella."),
        Member("Hermione", "Granger", note="Gryffindor"),
    ]
