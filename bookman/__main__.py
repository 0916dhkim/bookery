import sys
from PySide2.QtWidgets import (QApplication, QMainWindow, QWidget, QTabWidget)


class MainWindow(QMainWindow):
    def __init__(self):
        QMainWindow.__init__(self)

        "Create central tab widget."
        self.root = QTabWidget()
        self.setCentralWidget(self.root)

        "Create members tab."
        self.members_page = QWidget()
        self.root.addTab(self.members_page, "Members")

        "Create books tab."
        self.books_page = QWidget()
        self.root.addTab(self.books_page, "Books")

        "Initialize menu bar."
        self.file_menu = self.menuBar().addMenu(self.tr("File"))
        self.edit_menu = self.menuBar().addMenu(self.tr("Edit"))

        "Initialize status bar."
        self.statusBar().showMessage(self.tr("Ready"))


def main():
    app = QApplication()
    win = MainWindow()
    win.show()
    win.activateWindow()
    sys.exit(app.exec_())


if __name__ == "__main__":
    main()
