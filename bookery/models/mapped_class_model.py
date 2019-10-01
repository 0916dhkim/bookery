from __future__ import annotations
from PySide2.QtCore import QModelIndex, Qt, QAbstractTableModel
from bookery.persistence import Base
from sqlalchemy.event import listen
from sqlalchemy import bindparam, Column
from sqlalchemy.ext import baked
from sqlalchemy.orm import Session
from bookery.common import overrides
from typing import Any, List, Type, Iterable, Callable
from abc import ABCMeta, abstractmethod


class MappedClassModelMeta(type(QAbstractTableModel), ABCMeta):
    # QObject and ABC have different metaclass.
    # This metaclass is here to resolve the metaclass conflict.
    pass


class MappedClassModel(QAbstractTableModel, metaclass=MappedClassModelMeta):
    """Qt Model for Mapped Class

    Subclassing
    -----------
    To provide Qt Model for a SQLAlchemy mapped class, subclass this class.
    Override of `columns` `id_column` and `mapped_class` class methods is required.
    """

    @classmethod
    @abstractmethod
    def columns(cls) -> List[Column]:
        """Return columns to be exposed to Qt."""
        ...

    @classmethod
    @abstractmethod
    def id_column(cls) -> Column:
        """Return a column to be used for indexing."""
        ...

    @classmethod
    @abstractmethod
    def mapped_class(cls) -> Type[Base]:
        """Target SQLAlchemy class of this model."""

    @property
    def predicate(self):
        return self._predicate

    @predicate.setter
    def predicate(self, fn: Callable[[Iterable], Iterable]):
        self._predicate = fn
        self._rebuild_cache()

    def __init__(self, session: Session):
        QAbstractTableModel.__init__(self)
        self.session = session

        # Cache.
        self._id_list: list = []

        # Bakery.
        bakery = baked.bakery()

        self._predicate = lambda x: True

        def query_all_function(s: Session) -> baked.BakedQuery:
            return s.query(self.mapped_class())

        self._query_all: baked.BakedQuery = bakery(query_all_function)

        def query_one_function(s: Session) -> baked.BakedQuery:
            return s.query(self.mapped_class()).filter(
                self.id_column() == bindparam("id")
            )

        self._query_one: baked.BakedQuery = bakery(query_one_function)
        self._rebuild_cache()

        # Handle SQLAlchemy events.
        listen(self.mapped_class(), "after_delete", self._sql_after_delete)
        listen(self.mapped_class(), "after_insert", self._sql_after_insert)
        listen(self.mapped_class(), "after_update", self._sql_after_update)

    def query_all(self) -> Iterable:
        return filter(self.predicate, self._query_all(self.session))

    def query_one(self, id):
        result = self._query_one(self.session).params({"id": id}).one_or_none()
        if result is None:
            return None
        elif self.predicate(result):
            return result
        else:
            return None

    @overrides(QAbstractTableModel)
    def rowCount(self, parent: QModelIndex = QModelIndex()) -> int:
        if not parent.isValid():
            return len(self._id_list)
        else:
            return 0

    @overrides(QAbstractTableModel)
    def columnCount(self, parent: QModelIndex = QModelIndex()) -> int:
        if not parent.isValid():
            return len(self.columns())
        else:
            return 0

    @overrides(QAbstractTableModel)
    def data(self, index: QModelIndex, role: int = Qt.DisplayRole) -> Any:
        if index.isValid() and role in (Qt.DisplayRole, Qt.EditRole):
            instance = self.query_one(self._id_list[index.row()])
            assert isinstance(instance, self.mapped_class())
            return getattr(instance, self.columns()[index.column()].key)
        else:
            return None

    @overrides(QAbstractTableModel)
    def headerData(
        self, section: int, orientation: Qt.Orientation, role: int = Qt.DisplayRole
    ) -> Any:
        if role == Qt.DisplayRole and orientation == Qt.Horizontal:
            return self.columns()[section].key
        else:
            return None

    @overrides(QAbstractTableModel)
    def setData(self, index: QModelIndex, value: Any, role: int = Qt.EditRole) -> bool:
        if index.isValid() and role == Qt.EditRole:
            instance = self.query_one(self._id_list[index.row()])
            assert isinstance(instance, self.mapped_class())
            setattr(instance, self.columns()[index.column()].key, value)
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
            query_result = self.query_all()
            self._id_list = [getattr(x, self.id_column().key) for x in query_result]
        self.modelReset.emit()

    def _sql_after_delete(self, mapper, connection, target):
        assert isinstance(target, self.mapped_class())
        index = self._id_list.index(getattr(target, self.id_column().key))
        del self._id_list[index]
        self.rowsRemoved.emit(QModelIndex(), index, index)

    def _sql_after_insert(self, mapper, connection, target):
        assert isinstance(target, self.mapped_class())
        self._rebuild_cache()

    def _sql_after_update(self, mapper, connection, target):
        assert isinstance(target, self.mapped_class())
        index = self._id_list.index(getattr(target, self.id_column().key))
        self.dataChanged.emit(
            self.index(index, 0), self.index(index, self.columnCount() - 1)
        )
