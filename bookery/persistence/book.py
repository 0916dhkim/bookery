from bookery.persistence import Base
from sqlalchemy import Column, Integer, Text


class Book(Base):
    __tablename__ = "Books"

    id = Column("Id", Integer, primary_key=True)
    title = Column("Title", Text, nullable=False)
    author = Column("Author", Text)
    isbn = Column("Isbn", Text)
