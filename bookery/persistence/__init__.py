"""Data persistence of bookery application.

Using SQLAlchemy with SQLite database to save application data.
"""
from .base import Base
from .book import Book
from .member import Member
from .view import View
from sqlalchemy import create_engine
from sqlalchemy.engine.url import URL
from sqlalchemy.orm import Session, sessionmaker
from pathlib import Path


def create_session(url: URL) -> Session:
    """Create SQLAlchemy session"""
    engine = create_engine(url)
    return sessionmaker(bind=engine)()


def create_new_sqlite_database_file(path: Path):
    url = URL("sqlite", database=str(path))
    if path.exists():
        raise FileExistsError()
    else:
        engine = create_engine(url)
        Base.metadata.create_all(engine)


__all__ = [
    "Base",
    "Book",
    "Member",
    "View",
    "create_new_sqlite_database_file",
    "create_session",
]
