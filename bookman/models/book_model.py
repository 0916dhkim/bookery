from PySide2.QtCore import QModelIndex, Qt, QAbstractListModel
from bookman.persistence import Book
from sqlalchemy.orm import Session
from bookman.common import overrides
from typing import Any


class BookModel(QAbstractListModel):
    """Qt Model for Book Class"""

    def __init__(self, session: Session):
        QAbstractListModel.__init__(self)
        self.session = session

    @overrides(QAbstractListModel)
    def rowCount(self, parent: QModelIndex = QModelIndex()) -> int:
        if not parent.isValid():
            return self.session.query(Book).count()
        else:
            return 0

    @overrides(QAbstractListModel)
    def data(self, index: QModelIndex, role: int = Qt.DisplayRole) -> Any:
        if index.isValid() and role == Qt.DisplayRole:
            book = self.session.query(Book)[index.row()]
            assert isinstance(book, Book)
            return book.title
        else:
            return None
