from PySide2.QtCore import QAbstractItemModel, QModelIndex, Qt
from bookman.persistence import Base
from sqlalchemy.orm import Session
from sqlalchemy import Column, Table
from bookman.common import overrides


class BaseModel(QAbstractItemModel):
    """Qt Model for Base Class."""

    def __init__(self, session: Session):
        QAbstractItemModel.__init__(self)
        self._session = session

    @overrides(QAbstractItemModel)
    def index(
        self, row: int, column: int, parent: QModelIndex = QModelIndex()
    ) -> QModelIndex:
        """Internal pointer of each level is as follows::

        * 0 : None
        * 1 : table
        * 2 : column
        """
        ip = parent.internalPointer()
        if not parent.isValid():
            # The parent is the root node,
            # therefore, this is level 1 index.
            return self.createIndex(row, column, Base.metadata.sorted_tables[row])
        elif isinstance(ip, Table):
            # The parent is a table,
            # therefore, this is level 2 index.
            return self.createIndex(row, column, ip.columns.values()[column])
        else:
            return QModelIndex()

    @overrides(QAbstractItemModel)
    def parent(self, child: QModelIndex) -> QModelIndex:
        ip = child.internalPointer()
        if not child.isValid():
            return QModelIndex()
        elif isinstance(ip, Table):
            # Internal pointer of the child is a table,
            # therefore, the parent is level 0 (i.e. root).
            return QModelIndex()
        elif isinstance(ip, Column):
            # Internal pointer of the child is a column,
            # therefore, the parent is level 1.
            return self.index(Base.metadata.sorted_tables.index(ip.table), 0)
        else:
            return QModelIndex()

    @overrides(QAbstractItemModel)
    def rowCount(self, parent: QModelIndex = QModelIndex()) -> int:
        ip = parent.internalPointer()
        if not parent.isValid():
            # The parent is the root.
            # Find the number of tables.
            return len(Base.metadata.sorted_tables)
        elif isinstance(ip, Table):
            # Internal pointer of the parent is a table,
            # therefore, the parent is level 1.
            # Find the number of rows.
            return self._session.query(ip).count()
        else:
            return 0

    @overrides(QAbstractItemModel)
    def columnCount(self, parent: QModelIndex = QModelIndex()) -> int:
        ip = parent.internalPointer()
        if not parent.isValid():
            # The parent is the root (i.e. level 0).
            return 1
        elif isinstance(ip, Table):
            # Internal pointer of the parent is a table,
            # therefore, the parent is level 1.
            # Find the number of columns in table.
            return len(ip.columns)
        else:
            return 0

    @overrides(QAbstractItemModel)
    def data(self, index: QModelIndex, role: int = Qt.ItemDataRole.DisplayRole) -> Base:
        if not index.isValid():
            return None

        ip = index.internalPointer()
        if isinstance(ip, Column) and role == Qt.DisplayRole:
            # Internal pointer is a column,
            # therefore, this is level 2.
            return self._session.query(ip)[index.row()][0]
        else:
            return None

    @overrides(QAbstractItemModel)
    def flags(self, index: QModelIndex) -> Qt.ItemFlags:
        if index.isValid():
            return Qt.ItemIsEnabled
        else:
            return Qt.NoItemFlags
