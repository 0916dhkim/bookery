import datetime


class View:
    """Simple object representing a view"""

    def __init__(self, member_id: int, timestamp: datetime.time = None):
        self.member_id = member_id
        self.timestamp = timestamp
