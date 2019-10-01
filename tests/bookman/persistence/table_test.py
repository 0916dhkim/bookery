from bookery.persistence import create_new_sqlite_database_file
import logging
from pathlib import Path

logger = logging.getLogger(__name__)


def test_create_new_twice(tmp_path: Path):
    file_name = "collision.sqlite3"
    file_path = tmp_path / file_name

    create_new_sqlite_database_file(file_path)

    try:
        create_new_sqlite_database_file(file_path)
    except FileExistsError:
        # Failed attempt should not erase the original file.
        assert file_path.exists()
        return None
    logger.error("Existing file overwritten by new database.")
    assert False
