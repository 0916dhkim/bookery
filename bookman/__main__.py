import sys
from PySide2.QtWidgets import (QApplication, QLabel, QMainWindow, QWidget,
                               QVBoxLayout)


class MainWindow(QMainWindow):
    def __init__(self):
        QMainWindow.__init__(self)
        self.root = QWidget()
        self.setCentralWidget(self.root)
        self.layout = QVBoxLayout()
        self.root.setLayout(self.layout)
        self.label = QLabel("Hello World")
        self.layout.addWidget(self.label)

        "Initialize menu bar."
        self.menuBar().addMenu(self.tr("File"))
        self.menuBar().addMenu(self.tr("Edit"))

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
