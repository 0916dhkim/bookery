from PySide2.QtCore import QAbstractItemModel, QModelIndex, Qt
from bookman.persistence.table import Database, Table, SCHEMA
from bookman.common import overrides
from typing import Any
import sqlite3


class BaseModel(QAbstractItemModel):
    """Base Qt Model representing database.

    Structure of this model is like the following::

        ┌────┐
        │root│
        └┬───┘
         │┌──────┐
         ├┤Table1│
         │└┬─────┘
         │ │┌──────┬──────┬──────┐
         │ └┤Field1│Field2│Field3│
         │  ├──────┼──────┼──────┤
         │  ├──────┼──────┼──────┤
         │  ├──────┼──────┼──────┤
         │  └──────┴──────┴──────┘
         │┌──────┐
         └┤Table2│
          └┬─────┘
           │┌──────┬──────┬──────┐
           └┤Field1│Field2│Field3│
            ├──────┼──────┼──────┤
            ├──────┼──────┼──────┤
            ├──────┼──────┼──────┤
            └──────┴──────┴──────┘
    """

    def __init__(self, connection: sqlite3.Connection):
        QAbstractItemModel.__init__(self)
        self._connection = connection
        self._data = {t.name: t.select(self._connection) for t in SCHEMA.tables}

    @overrides(QAbstractItemModel)
    def index(
        self, row: int, column: int, parent: QModelIndex = QModelIndex()
    ) -> QModelIndex:
        """Internal pointer of each level is as follows::

        * root : None
        * table : root Database object
        * field : parent Table object
        """
        ip = parent.internalPointer()
        if not parent.isValid():
            # The parent is the root node.
            # Therefore, the index points to a table node.
            if row < len(SCHEMA.tables) and column == 0:
                return self.createIndex(row, column, SCHEMA)
            else:
                return QModelIndex()
        elif isinstance(ip, Database):
            # The parent is not the root node.
            # Therefore, the parent is a table and
            #  the index points to a field node.
            table = ip.tables[parent.row()]
            if all([row < len(self._data[table.name]), column < len(table.fields)]):
                return self.createIndex(row, column, table)
            else:
                return QModelIndex()
        else:
            return QModelIndex()

    @overrides(QAbstractItemModel)
    def parent(self, child: QModelIndex) -> QModelIndex:
        if not child.isValid():
            return QModelIndex()
        else:
            ip = child.internalPointer()
            if isinstance(ip, Database):
                # Internal pointer is database object.
                # Therefore, the parent node is the root.
                return QModelIndex()
            elif isinstance(ip, Table):
                # Internal pointer is table object.
                # Therefore, the parent node is a table.
                # Find the index of the parent table.
                return self.createIndex(SCHEMA.tables.index(ip), 0, SCHEMA)
            else:
                return QModelIndex()

    @overrides(QAbstractItemModel)
    def rowCount(self, parent: QModelIndex = QModelIndex()) -> int:
        ip = parent.internalPointer()
        if not parent.isValid():
            # The parent is the root.
            # Find the number of tables.
            return len(SCHEMA.tables)
        elif isinstance(ip, Database):
            # If internal pointer of parent index is Database object,
            # the parent is a table.
            # Find the number of rows inside the parent table.
            return len(self._data[SCHEMA.tables[parent.row()].name])
        else:
            return 0

    @overrides(QAbstractItemModel)
    def columnCount(self, parent: QModelIndex = QModelIndex()) -> int:
        ip = parent.internalPointer()
        if not parent.isValid():
            # The parent is the root.
            return 1
        elif isinstance(ip, Database):
            # If internal pointer of parent index is Database object,
            # the parent is a table.
            # Find the number of fields inside the parent table.
            return len(SCHEMA.tables[parent.row()].fields)
        else:
            return 0

    @overrides(QAbstractItemModel)
    def data(self, index: QModelIndex, role: int = Qt.ItemDataRole.DisplayRole) -> Any:
        ip = index.internalPointer()
        if not index.isValid():
            return None
        elif isinstance(ip, Database):
            # Internal pointer of the index is Database object.
            # Therefore, the index points to a table.
            # Return table name for display role.
            if role == Qt.ItemDataRole.DisplayRole:
                return SCHEMA.tables[index.row()].name
            else:
                return None
        elif isinstance(ip, Table):
            # Internal pointer of the index is Table object.
            # Therefore, the index points to a field.
            if role == Qt.ItemDataRole.DisplayRole:
                return self._data[ip.name][index.row()][ip.fields[index.column()].name]
