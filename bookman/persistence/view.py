from bookman.persistence import Base, Member
from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship


class View(Base):
    __tablename__ = "Views"

    id = Column("Id", Integer, primary_key=True)
    member_id = Column("MemberId", Integer, ForeignKey(Member.id), nullable=False)
    timestamp = Column("Timestamp", DateTime)

    member = relationship(Member, cascade="all")
