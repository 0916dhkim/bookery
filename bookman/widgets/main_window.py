from PySide2.QtWidgets import (QMainWindow, QWidget, QHBoxLayout, QVBoxLayout,
                               QPushButton, QStackedWidget)
from PySide2.QtCore import Qt
from .books_page import BooksPage
from .members_page import MembersPage
from functools import partial


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
        self.select_members_page = partial(self.setCurrentIndex,
                                           self._members_page_index)

        # Books page.
        self._books_page = BooksPage()
        self._books_page_index = self.addWidget(self._books_page)
        self.select_books_page = partial(self.setCurrentIndex,
                                         self._books_page_index)


class MainWindow(QMainWindow):
    def __init__(self):
        QMainWindow.__init__(self)

        # Central widget.
        self._root = QWidget()
        self.setCentralWidget(self._root)
        self._mainlayout = QHBoxLayout(self._root)

        # Sidebar.
        self._sidebar = SideBar()
        self._mainlayout.addWidget(self._sidebar)

        # Content pane.
        self._content = ContentWidget()
        self._mainlayout.addWidget(self._content)

        # Connect sidebar and contents pane.
        self._sidebar.members_button_clicked.connect(
            self._content.select_members_page)
        self._sidebar.books_button_clicked.connect(
            self._content.select_books_page)

        # Initialize menu bar.
        self.file_menu = self.menuBar().addMenu(self.tr("File"))
        self.edit_menu = self.menuBar().addMenu(self.tr("Edit"))

        # Initialize status bar.
        self.statusBar().showMessage(self.tr("Ready"))
