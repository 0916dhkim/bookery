from PySide2.QtWidgets import QWidget, QVBoxLayout, QLabel, QHeaderView, QTableView
from bookman.models import MemberModel
from bookman.persistence import Member
from PySide2.QtCore import Signal, Slot, QModelIndex


class MembersPage(QWidget):
    member_double_clicked = Signal(Member)

    def __init__(self):
        QWidget.__init__(self)
        self._layout = QVBoxLayout(self)
        self._layout.addWidget(QLabel("Members Page"))

        self._view = QTableView()
        self._view.horizontalHeader().setSectionResizeMode(QHeaderView.Stretch)
        self._view.setAlternatingRowColors(True)
        self._layout.addWidget(self._view)

        self._model: MemberModel = None

    def set_model(self, model: MemberModel):
        self._model = model
        self._view.setModel(model)

    @Slot(QModelIndex)
    def item_double_clicked(self, index: QModelIndex):
        pass
