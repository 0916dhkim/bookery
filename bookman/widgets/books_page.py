from PySide2.QtWidgets import (QWidget, QVBoxLayout, QLabel)


class BooksPage(QWidget):
    def __init__(self):
        QWidget.__init__(self)
        self._layout = QVBoxLayout(self)
        self._layout.addWidget(QLabel("Books Page"))
