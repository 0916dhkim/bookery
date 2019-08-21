import sphinx_rtd_theme

# Project information.
project = 'Bookman'
copyright = '2019, Donghyeon Kim'
author = 'Donghyeon Kim'

# Extensions.
extensions = ["sphinx.ext.autodoc", "sphinx.ext.napoleon", "sphinx_rtd_theme"]

# Autodoc configuration.
add_module_names = False

# Path configuration.
templates_path = ['_templates']
exclude_patterns = ['_build', 'Thumbs.db', '.DS_Store']

# HTML configuration.
assert sphinx_rtd_theme
html_theme = "sphinx_rtd_theme"
html_static_path = ['_static']
