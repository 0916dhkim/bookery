from bookman.persistence.table import SCHEMA
from bookman.common import overrides
from PySide2.QtCore import QAbstractProxyModel, QModelIndex


class TableModel(QAbstractProxyModel):
    """Proxy model for a table inside BaseModel.

    BaseModel models an entire database with multiple tables.
    In order to access individual tables, this proxy model provides
    2-dimensional model to represent a table.
    """

    def __init__(self, table_index: int):
        QAbstractProxyModel.__init__(self)
        self._table_index = table_index

    @overrides(QAbstractProxyModel)
    def mapFromSource(self, sourceIndex: QModelIndex) -> QModelIndex:
        # Root node and table nodes of the source model maps to
        # root node of the proxy model.
        # Each field node becomes a child of the root node of the
        # proxy model.
        if not sourceIndex.isValid():
            return QModelIndex()
        elif sourceIndex.parent().isValid():
            return QModelIndex()
        else:
            return self.index(sourceIndex.row(), sourceIndex.column())

    @overrides(QAbstractProxyModel)
    def mapToSource(self, proxyIndex: QModelIndex) -> QModelIndex:
        # Root node of the proxy model maps to the table node
        # of the source model.
        # Each field node of the proxy model maps to the corresponding
        # field node of the source model with its parent being a table node.
        source_table_index = self.sourceModel().index(self._table_index, 0)
        if not proxyIndex.isValid():
            return source_table_index
        else:
            return self.sourceModel().index(
                proxyIndex.row(), proxyIndex.column(), source_table_index
            )

    @overrides(QAbstractProxyModel)
    def rowCount(self, parent: QModelIndex = QModelIndex()) -> int:
        # Trivial implementation of rowCount.
        return self.sourceModel().rowCount(self.mapToSource(parent))

    @overrides(QAbstractProxyModel)
    def columnCount(self, parent: QModelIndex = QModelIndex()) -> int:
        # Trivial implementation of columnCount.
        return self.sourceModel().columnCount(self.mapToSource(parent))

    @overrides(QAbstractProxyModel)
    def parent(self, child: QModelIndex) -> QModelIndex:
        # Trivial implementation of parent.
        return self.mapFromSource(self.sourceModel().parent(self.mapToSource(child)))

    @overrides(QAbstractProxyModel)
    def index(
        self, row: int, column: int, parent: QModelIndex = QModelIndex()
    ) -> QModelIndex:
        if all(
            [
                not parent.isValid(),
                row
                < self.sourceModel().rowCount(
                    self.sourceModel().index(self._table_index, 0)
                ),
                column
                < self.sourceModel().columnCount(
                    self.sourceModel().index(self._table_index, 0)
                ),
            ]
        ):
            # Field node.
            # Internal pointer points to a table object.
            return self.createIndex(row, column, SCHEMA.tables[self._table_index])
        else:
            return QModelIndex()
