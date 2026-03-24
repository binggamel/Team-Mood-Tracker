from rest_framework import serializers
from apps.moods.models import MoodType
from .models import MoodEntry


class MoodEntrySerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.name", read_only=True)
    mood_emoji = serializers.CharField(source="mood_type.emoji", read_only=True)
    mood_label = serializers.CharField(source="mood_type.label", read_only=True)
    mood_color = serializers.CharField(source="mood_type.color", read_only=True)

    class Meta:
        model = MoodEntry
        fields = (
            "id",
            "user",
            "user_name",
            "date",
            "mood_type",
            "mood_emoji",
            "mood_label",
            "mood_color",
            "comment",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("user",)


class EntryUpsertSerializer(serializers.Serializer):
    date = serializers.DateField()
    mood_type = serializers.PrimaryKeyRelatedField(queryset=MoodType.objects.filter(is_active=True))
    comment = serializers.CharField(max_length=140, allow_blank=True, required=False)
