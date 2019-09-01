from PySide2.QtCore import (Qt, QAbstractTableModel, QModelIndex)
from typing import Any
from bookman.common import overrides
from bookman.persistence.table import query_books
import sqlite3


class BookTableModel(QAbstractTableModel):
    """Qt model for books in database."""
    def __init__(self, connection: sqlite3.Connection):
        QAbstractTableModel.__init__(self)
        self._connection = connection
        self._books = query_books(self._connection)
        self._fields = [
            "Title",
            "Author",
            "Isbn",
        ]

    @overrides(QAbstractTableModel)
    def data(self, index: QModelIndex,
             role: int = Qt.ItemDataRole.DisplayRole) -> Any:
        if all([index.isValid(), role == Qt.ItemDataRole.DisplayRole]):
            col_name = self._fields[index.column()]
            if col_name == "Title":
                return self._books[index.row()].title
            elif col_name == "Author":
                return self._books[index.row()].author
            elif col_name == "Isbn":
                return self._books[index.row()].isbn
            else:
                return None
        else:
            return None

    @overrides(QAbstractTableModel)
    def headerData(self, section: int, orientation: Qt.Orientation,
                   role: Qt.ItemDataRole.DisplayRole) -> Any:
        if all([
                role == Qt.ItemDataRole.DisplayRole,
                orientation == Qt.Orientation.Horizontal,
                section < len(self._fields)
        ]):
            return self._fields[section]
        else:
            return None

    @overrides(QAbstractTableModel)
    def rowCount(self, parent: QModelIndex = QModelIndex()) -> int:
        if parent == QModelIndex():
            return len(self._books)
        else:
            return 0

    @overrides(QAbstractTableModel)
    def columnCount(self, parent: QModelIndex = QModelIndex()) -> int:
        if parent == QModelIndex():
            return len(self._fields)
        else:
            return 0
