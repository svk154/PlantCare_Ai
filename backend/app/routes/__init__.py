# app/routes/__init__.py
# Makes routes a package and registers blueprints

from . import auth
from . import disease_detection
from . import calculators
from . import forum
from . import weather
from . import analytics
from . import profile
from . import farms
# Skip farm_notes import as those routes are already in farms.py
from . import monitored_crops
from . import disease_scans
from . import calculator_results
from . import delete_user

__all__ = [
    'auth', 'disease_detection', 'calculators', 'forum',
    'weather', 'analytics', 'profile', 'farms',
    'monitored_crops', 'disease_scans', 'calculator_results', 'delete_user'
]
