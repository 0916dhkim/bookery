from PySide2.QtWidgets import QStackedWidget
from bookman.widgets import BooksPage, MembersPage
from bookman.models import BookModel, MemberModel
from functools import partial


class ContentWidget(QStackedWidget):
    def __init__(self):
        QStackedWidget.__init__(self)

        # Members page.
        self._members_page = MembersPage()
        self._members_page_index = self.addWidget(self._members_page)
        self.select_members_page = partial(
            self.setCurrentIndex, self._members_page_index
        )

        # Books page.
        self._books_page = BooksPage()
        self._books_page_index = self.addWidget(self._books_page)
        self.select_books_page = partial(self.setCurrentIndex, self._books_page_index)

    def set_models(
        self, books_table_model: BookModel, members_table_model: MemberModel
    ):
        self._books_page.set_model(books_table_model)
        self._members_page.set_model(members_table_model)
