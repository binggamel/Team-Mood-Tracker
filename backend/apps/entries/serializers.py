from rest_framework import serializers
from apps.moods.models import MoodType
from .models import MoodEntry, AttendanceRecord


class MoodEntrySerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.name", read_only=True)
    mood_emoji = serializers.CharField(source="mood_type.emoji", read_only=True)
    mood_label = serializers.CharField(source="mood_type.label", read_only=True)
    mood_color = serializers.CharField(source="mood_type.color", read_only=True)
    like_count = serializers.SerializerMethodField()
    liked_by_me = serializers.SerializerMethodField()

    def get_like_count(self, obj):
        return obj.likes.count()

    def get_liked_by_me(self, obj):
        request = self.context.get("request")
        if not request or not request.user or request.user.is_anonymous:
            return False
        return any(user.pk == request.user.pk for user in obj.likes.all())

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
            "like_count",
            "liked_by_me",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("user",)


class EntryUpsertSerializer(serializers.Serializer):
    date = serializers.DateField()
    mood_type = serializers.PrimaryKeyRelatedField(queryset=MoodType.objects.filter(is_active=True))
    comment = serializers.CharField(max_length=140, allow_blank=True, required=False)


class AttendanceRecordSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.name", read_only=True)

    class Meta:
        model = AttendanceRecord
        fields = (
            "id",
            "user",
            "user_name",
            "date",
            "check_in",
            "check_out",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("user",)


class AttendanceUpsertSerializer(serializers.Serializer):
    date = serializers.DateField()
    check_in = serializers.TimeField(format="%H:%M", input_formats=["%H:%M", "%H:%M:%S"])
    check_out = serializers.TimeField(format="%H:%M", input_formats=["%H:%M", "%H:%M:%S"])
