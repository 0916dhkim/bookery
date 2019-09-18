from PySide2.QtWidgets import QWidget, QVBoxLayout, QLabel, QListView
from bookman.models import MemberModel
from bookman.persistence import Member
from PySide2.QtCore import Signal, Slot, QModelIndex


class MembersPage(QWidget):
    member_double_clicked = Signal(Member)

    def __init__(self):
        QWidget.__init__(self)
        self._layout = QVBoxLayout(self)
        self._layout.addWidget(QLabel("Members Page"))
        self._view = QListView()
        self._layout.addWidget(self._view)

    def set_model(self, model: MemberModel):
        self._view.setModel(model)

    @Slot(QModelIndex)
    def item_double_clicked(self, index: QModelIndex):
        self.member_double_clicked.emit(index.data())
