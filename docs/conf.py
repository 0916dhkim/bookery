# Project information.
project = 'Bookman'
copyright = '2019, Donghyeon Kim'
author = 'Donghyeon Kim'

# Extensions.
extensions = ["sphinx.ext.autodoc", "sphinx.ext.napoleon"]

# Path configuration.
templates_path = ['_templates']
exclude_patterns = ['_build', 'Thumbs.db', '.DS_Store']

# HTML configuration.
html_theme = 'alabaster'
html_static_path = ['_static']