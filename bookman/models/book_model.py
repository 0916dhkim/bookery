from bookman.models import MappedClassModel
from bookman.persistence import Book
from bookman.common import overrides


class BookModel(MappedClassModel):
    @overrides(MappedClassModel)
    def columns(cls):
        return [Book.title, Book.author, Book.isbn]

    @overrides(MappedClassModel)
    def id_column(cls):
        return Book.id

    @overrides(MappedClassModel)
    def mapped_class(cls):
        return Book
