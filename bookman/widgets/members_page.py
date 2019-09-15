from PySide2.QtWidgets import QWidget, QVBoxLayout, QLabel, QListView
from bookman.models import MemberModel


class MembersPage(QWidget):
    def __init__(self):
        QWidget.__init__(self)
        self._layout = QVBoxLayout(self)
        self._layout.addWidget(QLabel("Members Page"))
        self._view = QListView()
        self._layout.addWidget(self._view)

    def set_model(self, model: MemberModel):
        self._view.setModel(model)
