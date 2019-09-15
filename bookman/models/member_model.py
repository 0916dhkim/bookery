from PySide2.QtCore import QAbstractListModel, QModelIndex, Qt
from bookman.persistence import Member
from sqlalchemy.orm import Session
from bookman.common import overrides
from typing import Any


class MemberModel(QAbstractListModel):
    """Qt Model for Member Class"""

    def __init__(self, session: Session):
        QAbstractListModel.__init__(self)
        self.session = session
        self.columns = [Member.first_name, Member.last_name, Member.note]

    @overrides(QAbstractListModel)
    def rowCount(self, parent: QModelIndex = QModelIndex()) -> int:
        if not parent.isValid():
            return self.session.query(Member).count()
        else:
            return 0

    @overrides(QAbstractListModel)
    def data(self, index: QModelIndex, role: int = Qt.DisplayRole) -> Any:
        if index.isValid() and role == Qt.DisplayRole:
            member = self.session.query(Member)[index.row()]
            assert isinstance(member, Member)
            return f"{member.last_name}, {member.first_name}"
        else:
            return None
