"""Pytest Configuration

This module configures pytest behavior.
"""
from pathlib import Path


def pytest_configure(config):
    project_root = Path(__file__).parent

    # log_file
    if not config.option.log_file:
        log_path = project_root / "pytest.log"
        print("log_file: %s" % log_path)
        config.option.log_file = str(log_path)

    # log_file_level
    if not config.option.log_file_level:
        log_file_level = "DEBUG"
        print("log_file_level: %s" % log_file_level)
        config.option.log_file_level = log_file_level

    # log_file_format
    if not config.option.log_file_format:
        log_file_format = (r"%(levelname)s "
                           r"%(name)s:%(funcName)s:%(lineno)-4d "
                           r"%(message)s")
        print("log_file_format: %s" % log_file_format)
        config.option.log_file_format = log_file_format
