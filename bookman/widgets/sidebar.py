from PySide2.QtWidgets import QWidget, QVBoxLayout, QPushButton
from PySide2.QtCore import Qt


class SideBar(QWidget):
    def __init__(self):
        QWidget.__init__(self)

        # Layout.
        self._layout = QVBoxLayout(self)
        self._layout.setAlignment(Qt.AlignTop)

        # Buttons.
        self._members_button = QPushButton(self.tr("Members"))
        self.members_button_clicked = self._members_button.clicked
        self._layout.addWidget(self._members_button)
        self._books_button = QPushButton(self.tr("Books"))
        self.books_button_clicked = self._books_button.clicked
        self._layout.addWidget(self._books_button)
