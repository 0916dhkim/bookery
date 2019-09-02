from PySide2.QtCore import (QAbstractItemModel, QModelIndex, Qt)
from bookman.persistence.table import (query_books, query_members)
from bookman.persistence import (Book, Member)
from bookman.common import overrides
from typing import Any
import sqlite3


class BaseModel(QAbstractItemModel):
    """Base Qt Model representing database.

    Structure of this model is like the following::

        ┌────┐
        │root│
        └┬───┘
         │┌─────┐
         ├┤books│
         │└┬────┘
         │ │┌─────┬──────┬────┐
         │ └┤Title│Author│ISBN│
         │  ├─────┼──────┼────┤
         │  ├─────┼──────┼────┤
         │  ├─────┼──────┼────┤
         │  └─────┴──────┴────┘
         │┌───────┐
         └┤members│
          └┬──────┘
           │┌─────────┬─────────┬────┐
           └┤FirstName│Last Name│Note│
            ├─────────┼─────────┼────┤
            ├─────────┼─────────┼────┤
            ├─────────┼─────────┼────┤
            └─────────┴─────────┴────┘
    """
    def __init__(self, connection: sqlite3.Connection):
        QAbstractItemModel.__init__(self)
        self._connection = connection

        self._books = query_books(self._connection)
        self._members = query_members(self._connection)

    @overrides(QAbstractItemModel)
    def index(self, row: int, column: int,
              parent: QModelIndex = QModelIndex()) -> QModelIndex:
        if not parent.isValid():
            # The parent is the root node.
            # The root node has two child nodes: books and members.
            if row == 0 and column == 0:
                return self.createIndex(0, 0, self._books)
            elif row == 1 and column == 0:
                return self.createIndex(1, 0, self._members)
            else:
                return QModelIndex()
        else:
            # The parent is not the root node.
            # The parent has to be either books node or members node.
            parent_object = parent.internalPointer()
            if all([
                    parent_object is self._books, row < len(self._books),
                    column < 3
            ]):
                return self.createIndex(row, column, self._books[row])
            elif all([
                    parent_object is self._members, row < len(self._members),
                    column < 3
            ]):
                return self.createIndex(row, column, self._members[row])
            else:
                return QModelIndex()

    @overrides(QAbstractItemModel)
    def parent(self, child: QModelIndex) -> QModelIndex:
        if not child.isValid():
            return QModelIndex()
        else:
            child_object = child.internalPointer()
            if child_object is self._books or child_object is self._members:
                return QModelIndex()
            elif type(child_object) is Book:
                return self.index(0, 0)
            elif type(child_object) is Member:
                return self.index(1, 0)
            else:
                return QModelIndex()

    @overrides(QAbstractItemModel)
    def rowCount(self, parent: QModelIndex = QModelIndex()) -> int:
        if not parent.isValid():
            return 2
        else:
            parent_object = parent.internalPointer()
            if parent_object is self._books:
                return len(self._books)
            elif parent_object is self._members:
                return len(self._members)
            else:
                return 0

    @overrides(QAbstractItemModel)
    def columnCount(self, parent: QModelIndex = QModelIndex()) -> int:
        if not parent.isValid():
            return 1
        else:
            parent_object = parent.internalPointer()
            if parent_object is self._books:
                return 3
            elif parent_object is self._members:
                return 3
            else:
                return 0

    @overrides(QAbstractItemModel)
    def data(self, index: QModelIndex,
             role: int = Qt.ItemDataRole.DisplayRole) -> Any:
        if not index.isValid():
            return None
        else:
            obj = index.internalPointer()
            if obj is self._books or obj is self._members:
                return None
            elif type(obj) is Book:
                if index.column() == 0:
                    return obj.title
                elif index.column() == 1:
                    return obj.author
                elif index.column() == 2:
                    return obj.isbn
                assert False  # Wrong column number.
            elif type(obj) is Member:
                if index.column() == 0:
                    return obj.first_name
                elif index.column() == 1:
                    return obj.last_name
                elif index.column() == 2:
                    return obj.note
                assert False  # Wrong column number.
