from PySide2.QtWidgets import (
    QMainWindow,
    QWidget,
    QHBoxLayout,
    QVBoxLayout,
    QPushButton,
    QStackedWidget,
    QAction,
    QMenu,
    QFileDialog,
)
from PySide2.QtCore import Qt, Slot
from bookman.widgets import BooksPage, MembersPage
from bookman.models import BaseModel, TableModel
from bookman.persistence import Book, Member, create_session
from functools import partial
from sqlalchemy.orm import Session
from sqlalchemy.engine.url import URL
import pathlib
import logging

logger = logging.getLogger(__name__)


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
        self, books_table_model: TableModel, members_table_model: TableModel
    ):
        self._books_page.set_model(books_table_model)
        self._members_page.set_model(members_table_model)


class MainWindow(QMainWindow):
    def __init__(self):
        QMainWindow.__init__(self)

        # Central widget.
        self._root = QWidget()
        self.setCentralWidget(self._root)
        self._mainlayout = QHBoxLayout(self._root)

        # Model
        self._session: Session = None
        self._base_model: BaseModel = None

        # Sidebar.
        self._sidebar = SideBar()
        self._mainlayout.addWidget(self._sidebar)

        # Content pane.
        self._content = ContentWidget()
        self._mainlayout.addWidget(self._content)

        # Connect sidebar and contents pane.
        self._sidebar.members_button_clicked.connect(self._content.select_members_page)
        self._sidebar.books_button_clicked.connect(self._content.select_books_page)

        # Initialize menu bar.
        # File menu.
        self.file_menu: QMenu = self.menuBar().addMenu(self.tr("File"))
        self.new_action = QAction(self.tr("New"), self)
        self.new_action.triggered.connect(self.new_file)
        self.file_menu.addAction(self.new_action)
        self.open_action = QAction(self.tr("Open"), self)
        self.open_action.triggered.connect(self.open_file)
        self.file_menu.addAction(self.open_action)
        # Edit menu.
        self.edit_menu: QMenu = self.menuBar().addMenu(self.tr("Edit"))
        self.add_member_action = QAction(self.tr("Add Member"), self)
        self.add_member_action.triggered.connect(self.add_member)
        self.edit_menu.addAction(self.add_member_action)
        self.add_book_action = QAction(self.tr("Add Book"), self)
        self.add_book_action.triggered.connect(self.add_book)
        self.edit_menu.addAction(self.add_book_action)

        # Initialize status bar.
        self.statusBar().showMessage(self.tr("Ready"))

    @Slot()
    def new_file(self):
        """TODO"""
        pass

    @Slot()
    def open_file(self):
        """Open file dialog.

        If the user cancels the dialog, no further action is taken.
        If the user selects a file, open SQLite connection
        to the selected file.
        """
        file_name, _ = QFileDialog.getOpenFileName(self, self.tr("Open File"))
        if file_name != "":
            # Dialog is not cancelled.
            self.use_database(pathlib.Path(file_name))

    @Slot()
    def add_member(self):
        """TODO"""
        pass

    @Slot()
    def add_book(self):
        """TODO"""
        pass

    def use_database(self, path: pathlib.Path):
        """Open database file and update model."""
        try:
            self._session = create_session(URL('sqlite', database=str(path)))
            self._base_model = BaseModel(self._session)
            books_table_model = TableModel(Book)
            books_table_model.setSourceModel(self._base_model)
            members_table_model = TableModel(Member)
            members_table_model.setSourceModel(self._base_model)
            self._content.set_models(books_table_model, members_table_model)
        except Exception as e:
            logger.exception(e)
            raise e
