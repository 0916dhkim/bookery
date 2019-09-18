from PySide2.QtWidgets import QWidget, QVBoxLayout, QLabel, QListView
from bookman.models import BookModel
from bookman.persistence import Book
from PySide2.QtCore import Signal, Slot, QModelIndex


class BooksPage(QWidget):
    book_double_clicked = Signal(Book)

    def __init__(self):
        QWidget.__init__(self)
        self._layout = QVBoxLayout(self)
        self._layout.addWidget(QLabel("Books Page"))
        self._view = QListView()
        self._view.doubleClicked.connect(self.item_double_clicked)
        self._layout.addWidget(self._view)

    def set_model(self, model: BookModel):
        self._view.setModel(model)

    @Slot(QModelIndex)
    def item_double_clicked(self, index: QModelIndex):
        self.book_double_clicked.emit(index.data())
