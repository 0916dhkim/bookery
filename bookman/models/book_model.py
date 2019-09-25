from PySide2.QtCore import QModelIndex, Qt, QAbstractTableModel
from bookman.persistence import Book
from sqlalchemy.event import listen
from sqlalchemy import bindparam
from sqlalchemy.orm import Session, Query
from bookman.common import overrides
from typing import Any, List


class BookModel(QAbstractTableModel):
    """Qt Model for Book Class"""

    columns = [Book.title, Book.author, Book.isbn]

    def __init__(self, session: Session):
        QAbstractTableModel.__init__(self)
        self.session = session

        # Cache.
        self._id_list: List[int] = []
        self._query_all: Query = session.query(Book)
        self._query_by_id: Query = session.query(Book).filter(
            Book.id == bindparam("id")
        )
        self._rebuild_cache()

        # Handle SQLAlchemy events.
        listen(Book, "after_delete", self._sql_after_delete)
        listen(Book, "after_insert", self._sql_after_insert)
        listen(Book, "after_update", self._sql_after_update)

    @overrides(QAbstractTableModel)
    def rowCount(self, parent: QModelIndex = QModelIndex()) -> int:
        if not parent.isValid():
            return len(self._id_list)
        else:
            return 0

    @overrides(QAbstractTableModel)
    def columnCount(self, parent: QModelIndex = QModelIndex()) -> int:
        if not parent.isValid():
            return len(BookModel.columns)
        else:
            return 0

    @overrides(QAbstractTableModel)
    def data(self, index: QModelIndex, role: int = Qt.DisplayRole) -> Any:
        if index.isValid() and role in (Qt.DisplayRole, Qt.EditRole):
            book = self._query_by_id.params(id=self._id_list[index.row()]).one()
            assert isinstance(book, Book)
            return getattr(book, BookModel.columns[index.column()].key)
        else:
            return None

    @overrides(QAbstractTableModel)
    def headerData(
        self, section: int, orientation: Qt.Orientation, role: int = Qt.DisplayRole
    ) -> Any:
        if role == Qt.DisplayRole and orientation == Qt.Horizontal:
            return BookModel.columns[section].key
        else:
            return None

    @overrides(QAbstractTableModel)
    def setData(self, index: QModelIndex, value: Any, role: int = Qt.EditRole) -> bool:
        if index.isValid() and role == Qt.EditRole:
            book = self._query_by_id.params(id=self._id_list[index.row()]).one()
            assert isinstance(book, Book)
            setattr(book, BookModel.columns[index.column()].key, value)
            return True
        else:
            return False

    @overrides(QAbstractTableModel)
    def flags(self, index: QModelIndex) -> Qt.ItemFlags:
        if not index.isValid():
            return Qt.NoItemFlags
        else:
            return Qt.ItemIsEnabled | Qt.ItemIsSelectable | Qt.ItemIsEditable

    def _rebuild_cache(self):
        with self.session.no_autoflush:
            query_result: List[Book] = self._query_all.all()
            self._id_list = [x.id for x in query_result]

    def _sql_after_delete(self, mapper, connection, target: Book):
        index = self._id_list.index(target.id)
        del self._id_list[index]
        self.rowsRemoved.emit(QModelIndex(), index, index)

    def _sql_after_insert(self, mapper, connection, target: Book):
        self._rebuild_cache()

    def _sql_after_update(self, mapper, connection, target: Book):
        index = self._id_list.index(target.id)
        self.dataChanged.emit(
            self.index(index, 0), self.index(index, self.columnCount() - 1)
        )
