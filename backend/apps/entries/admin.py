from django.contrib import admin
from .models import MoodEntry


@admin.register(MoodEntry)
class MoodEntryAdmin(admin.ModelAdmin):
    list_display = ("id", "date", "user", "mood_type", "comment", "updated_at")
    list_filter = ("date", "mood_type")
    search_fields = ("user__name", "comment")
