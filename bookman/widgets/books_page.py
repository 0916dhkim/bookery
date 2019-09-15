from PySide2.QtWidgets import QWidget, QVBoxLayout, QLabel, QListView
from bookman.models import BookModel


class BooksPage(QWidget):
    def __init__(self):
        QWidget.__init__(self)
        self._layout = QVBoxLayout(self)
        self._layout.addWidget(QLabel("Books Page"))
        self._view = QListView()
        self._layout.addWidget(self._view)

    def set_model(self, model: BookModel):
        self._view.setModel(model)
