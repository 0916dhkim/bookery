from setuptools import setup, find_packages
import os.path

root_dir = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(root_dir, 'VERSION')) as version_file:
    version = version_file.read().strip()
INSTALL_REQUIRES = ["pyside2", "semver"]

setup(name="bookman",
      version=version,
      description="Bookclub Manager",
      packages=find_packages(exclude=["tests"]),
      entry_points={"console_scripts": ["bookman = bookman.__main__:main"]},
      install_requires=INSTALL_REQUIRES)
