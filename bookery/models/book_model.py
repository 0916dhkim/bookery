from bookery.models import MappedClassModel
from bookery.persistence import Book
from bookery.common import overrides


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
