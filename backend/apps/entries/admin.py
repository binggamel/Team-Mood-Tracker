from django.contrib import admin
from .models import MoodEntry, AttendanceRecord


@admin.register(MoodEntry)
class MoodEntryAdmin(admin.ModelAdmin):
    list_display = ("id", "date", "user", "mood_type", "comment", "updated_at")
    list_filter = ("date", "mood_type")
    search_fields = ("user__name", "comment")


@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(admin.ModelAdmin):
    list_display = ("id", "date", "user", "check_in", "check_out", "updated_at")
    list_filter = ("date",)
    search_fields = ("user__name",)
