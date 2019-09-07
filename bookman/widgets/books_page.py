from PySide2.QtWidgets import QWidget, QVBoxLayout, QLabel, QTableView, QHeaderView
from bookman.models import TableModel


class BooksPage(QWidget):
    def __init__(self):
        QWidget.__init__(self)
        self._layout = QVBoxLayout(self)
        self._layout.addWidget(QLabel("Books Page"))
        self._view = QTableView()
        self._view.horizontalHeader().setSectionResizeMode(QHeaderView.Stretch)
        self._view.verticalHeader().setSectionResizeMode(QHeaderView.Fixed)
        self._layout.addWidget(self._view)

    def set_model(self, model: TableModel):
        self._view.setModel(model)
