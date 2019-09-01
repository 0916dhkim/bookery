class Member():
    """Simple object representing a member"""
    def __init__(self,
                 first_name: str,
                 last_name: str,
                 note: str = None):
        self.first_name = first_name
        self.last_name = last_name
        self.note = note
