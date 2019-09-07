class Book:
    """Simple object representing a book"""

    def __init__(self, title: str, author: str = None, isbn: str = None):
        self.title = title
        self.author = author
        self.isbn = isbn
