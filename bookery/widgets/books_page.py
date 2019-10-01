from PySide2.QtWidgets import QWidget, QVBoxLayout, QLabel, QHeaderView, QTableView
from bookery.models import BookModel
from bookery.persistence import Book
from PySide2.QtCore import Signal, Slot, QModelIndex


class BooksPage(QWidget):
    book_double_clicked = Signal(Book)

    def __init__(self):
        QWidget.__init__(self)
        self._layout = QVBoxLayout(self)
        self._layout.addWidget(QLabel("Books Page"))

        self._view = QTableView()
        self._view.horizontalHeader().setSectionResizeMode(QHeaderView.Stretch)
        self._view.setAlternatingRowColors(True)
        self._layout.addWidget(self._view)

        self._model: BookModel = None

    def set_model(self, model: BookModel):
        self._model = model
        self._view.setModel(model)

    @Slot(QModelIndex)
    def item_double_clicked(self, index: QModelIndex):
        pass
