from rest_framework import serializers
from django.utils.text import slugify
from .models import MoodType


class MoodTypeSerializer(serializers.ModelSerializer):
    key = serializers.CharField(read_only=True)

    class Meta:
        model = MoodType
        fields = ("id", "key", "label", "emoji", "color", "sort_order")

    def create(self, validated_data):
        base = slugify(validated_data["label"])[:20] or "mood"
        key = base
        suffix = 2
        while MoodType.objects.filter(key=key).exists():
            key = f"{base}-{suffix}"
            suffix += 1

        if "sort_order" not in validated_data:
            last = MoodType.objects.order_by("-sort_order").first()
            validated_data["sort_order"] = (last.sort_order + 1) if last else 0

        return MoodType.objects.create(key=key, **validated_data)
