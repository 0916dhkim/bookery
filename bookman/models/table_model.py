from bookman.models import BaseModel
from bookman.persistence import Base
from PySide2.QtCore import QAbstractProxyModel, QModelIndex, Qt
from bookman.common import overrides
from sqlalchemy import Table, Column
from typing import Type, Any


class TableModel(QAbstractProxyModel):
    """Proxy model for BaseModel."""

    def __init__(self, obj_type: Type[Base]):
        QAbstractProxyModel.__init__(self)
        self._obj_type = obj_type
        self._source_model: BaseModel = None

    @overrides(QAbstractProxyModel)
    def setSourceModel(self, sourceModel: BaseModel):
        self.beginResetModel()
        self._source_model = sourceModel
        self.endResetModel()

    @overrides(QAbstractProxyModel)
    def sourceModel(self) -> BaseModel:
        return self._source_model

    @overrides(QAbstractProxyModel)
    def mapFromSource(self, sourceIndex: QModelIndex) -> QModelIndex:
        ip = sourceIndex.internalPointer()
        if not sourceIndex.isValid():
            return QModelIndex()
        elif isinstance(ip, Table):
            return QModelIndex()
        elif isinstance(ip, Column):
            return self.index(sourceIndex.row(), sourceIndex.column())
        else:
            return QModelIndex()

    @overrides(QAbstractProxyModel)
    def mapToSource(self, proxyIndex: QModelIndex) -> QModelIndex:
        ip = proxyIndex.internalPointer()
        table_index = self.sourceModel().index(
            Base.metadata.sorted_tables.index(self._obj_type.__table__), 0
        )
        if not proxyIndex.isValid():
            return table_index
        elif isinstance(ip, Column):
            return table_index.child(proxyIndex.row(), proxyIndex.column())
        else:
            return QModelIndex()

    @overrides(QAbstractProxyModel)
    def rowCount(self, parent: QModelIndex = QModelIndex()) -> int:
        if not parent.isValid():
            return self.sourceModel().rowCount(
                self.sourceModel().index(
                    Base.metadata.sorted_tables.index(self._obj_type.__table__), 0
                )
            )
        else:
            return 0

    @overrides(QAbstractProxyModel)
    def columnCount(self, parent: QModelIndex = QModelIndex()) -> int:
        if not parent.isValid():
            return len(self._obj_type.__table__.columns)
        else:
            return 0

    @overrides(QAbstractProxyModel)
    def headerData(
        self, section: int, orientation: Qt.Orientation, role: int = Qt.DisplayRole
    ):
        if orientation == Qt.Horizontal and role == Qt.DisplayRole:
            return self._obj_type.__table__.columns.keys()[section]
        else:
            None

    @overrides(QAbstractProxyModel)
    def parent(self, index: QModelIndex) -> QModelIndex:
        return QModelIndex()

    @overrides(QAbstractProxyModel)
    def flags(self, index: QModelIndex) -> Qt.ItemFlags:
        return self.sourceModel().flags(self.mapToSource(index))

    @overrides(QAbstractProxyModel)
    def index(
        self, row: int, column: int, parent: QModelIndex = QModelIndex()
    ) -> QModelIndex:
        """Internal pointer of each level is as follows::

        * 0 : None
        * 1 : column
        """
        if not parent.isValid():
            return self.createIndex(
                row, column, self._obj_type.__table__.columns.values()[column]
            )
        else:
            return QModelIndex()

    @overrides(QAbstractProxyModel)
    def data(self, index: QModelIndex, role: int = Qt.DisplayRole) -> Any:
        return self.sourceModel().data(self.mapToSource(index), role)
