from typing import Type, Callable


def overrides(parent_class: Type) -> Callable:
    """Decorator to check if a method is overriding parent class."""

    def checked(method: Callable) -> Callable:
        assert method.__name__ in dir(parent_class)
        return method

    return checked
