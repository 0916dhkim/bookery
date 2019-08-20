import logging

logger = logging.getLogger(__name__)


def test_test():
    logger.debug("Test if pytest is working.")
    assert True
