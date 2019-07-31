from setuptools import setup, find_packages

INSTALL_REQUIRES = ["pyside2"]

setup(name="bookman",
      version="0.0.1",
      description="Bookclub Manager",
      packages=find_packages(exclude=["tests"]),
      entry_points={"console_scripts": ["bookman = bookman.__main__:main"]},
      install_requires=INSTALL_REQUIRES)
