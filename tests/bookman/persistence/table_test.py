from bookman.persistence.table import (new_database, APPLICATION_ID,
                                       USER_VERSION)
import logging
from pathlib import Path
import sqlite3

logger = logging.getLogger(__name__)


def test_new_database(tmp_path: Path):
    logger.debug("Using temporary directory: %s" % tmp_path)
    file_name = "sample.sqlite3"
    file_path = tmp_path / file_name
    new_database(file_path)

    # New database should be created in the designated path.
    assert file_path.exists()

    # Check if the content inside the new database is correct.
    connection = sqlite3.connect(file_path)
    with connection:
        cursor = connection.cursor()
        cursor.row_factory = sqlite3.Row

        cursor.execute("PRAGMA APPLICATION_ID")
        database_application_id = cursor.fetchone()["APPLICATION_ID"]
        logger.debug("database_application_id = %#x" % database_application_id)
        assert database_application_id == APPLICATION_ID

        cursor.execute("PRAGMA USER_VERSION")
        database_user_version = cursor.fetchone()["USER_VERSION"]
        logger.debug("database_user_version = %#x" % database_user_version)
        assert database_user_version == USER_VERSION


def test_new_database_twice(tmp_path: Path):
    logger.debug("Using temporary directory: %s" % tmp_path)
    file_name = "collision.sqlite3"
    file_path = tmp_path / file_name

    # Create the first database.
    new_database(file_path)
    # Attempt to create a database to the same path should fail.
    failed = False
    try:
        new_database(file_path)
    except Exception:
        failed = True
        # Failed attempt should not erase the original file.
        assert file_path.exists()
    if not failed:
        logger.error("Existing file overwritten by new database.")
        assert False
