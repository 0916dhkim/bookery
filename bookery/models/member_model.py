from bookery.models import MappedClassModel
from bookery.persistence import Member
from bookery.common import overrides


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
