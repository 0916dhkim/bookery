from bookery.persistence import Base
from sqlalchemy import Column, Integer, Text


class Member(Base):
    __tablename__ = "Members"

    id = Column("Id", Integer, primary_key=True)
    first_name = Column("FirstName", Text, nullable=False)
    last_name = Column("LastName", Text, nullable=False)
    note = Column("Note", Text)
