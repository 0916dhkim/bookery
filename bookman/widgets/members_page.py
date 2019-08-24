from PySide2.QtWidgets import (QWidget, QVBoxLayout, QLabel)


class MembersPage(QWidget):
    def __init__(self):
        QWidget.__init__(self)
        self._layout = QVBoxLayout()
        self.setLayout(self._layout)
        self._layout.addWidget(QLabel("Members Page"))
