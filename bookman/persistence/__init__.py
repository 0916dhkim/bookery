"""Data persistence of bookman application.

This module provides functions and classes to save/load data for Bookman.
"""
from .book import Book
from .member import Member
from . import table

__all__ = [
    'Book',
    'Member',
    'table',
]
