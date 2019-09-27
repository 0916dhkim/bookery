from bookman.models import MappedClassModel
from bookman.persistence import Member
from bookman.common import overrides


class MemberModel(MappedClassModel):
    @overrides(MappedClassModel)
    def columns(cls):
        return [Member.first_name, Member.last_name, Member.note]

    @overrides(MappedClassModel)
    def id_column(cls):
        return Member.id

    @overrides(MappedClassModel)
    def mapped_class(cls):
        return Member
