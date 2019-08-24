import sys
from bookman.widgets.main_window import MainWindow
from PySide2.QtWidgets import QApplication


def main():
    app = QApplication()
    win = MainWindow()
    win.show()
    win.activateWindow()
    sys.exit(app.exec_())


if __name__ == "__main__":
    main()
