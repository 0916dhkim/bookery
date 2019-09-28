from PySide2.QtWidgets import (
    QWidget,
    QVBoxLayout,
    QLabel,
    QHeaderView,
    QTableView,
    QLineEdit,
)
from bookman.models import MemberModel
from bookman.persistence import Member
from PySide2.QtCore import Signal, Slot, QModelIndex


class MembersPage(QWidget):
    member_double_clicked = Signal(Member)

    def __init__(self):
        QWidget.__init__(self)
        self._layout = QVBoxLayout(self)
        self._layout.addWidget(QLabel("Members Page"))

        self._search_bar = QLineEdit()
        self._search_bar.textChanged.connect(self.change_search_query)
        self._layout.addWidget(self._search_bar)

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

    @Slot(str)
    def change_search_query(self, search_query: str):
        """Update the filter predicate of the model."""

        def predicate(x: Member) -> bool:
            query_word_set = set(search_query.split())
            for w in query_word_set:
                upper_w = w.upper()
                if all(
                    [
                        upper_w not in x.first_name.upper(),
                        upper_w not in x.last_name.upper(),
                        upper_w not in (x.last_name + x.first_name).upper(),
                        upper_w not in x.note.upper(),
                    ]
                ):
                    return False
            return True

        self._model.predicate = predicate
