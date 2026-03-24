from django.contrib import admin
from .models import MoodType


@admin.register(MoodType)
class MoodTypeAdmin(admin.ModelAdmin):
    list_display = ("id", "emoji", "label", "key", "sort_order", "is_active")
    list_editable = ("sort_order", "is_active")
