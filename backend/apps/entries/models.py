from django.db import models
from django.conf import settings
from apps.moods.models import MoodType


class MoodEntry(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="mood_entries")
    date = models.DateField()
    mood_type = models.ForeignKey(MoodType, on_delete=models.PROTECT)
    comment = models.CharField(max_length=140, blank=True)
    likes = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name="liked_mood_entries", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "date"], name="unique_user_date_entry"),
        ]
        indexes = [
            models.Index(fields=["date"]),
            models.Index(fields=["user", "date"]),
        ]
        ordering = ("date", "user_id")

    def __str__(self) -> str:
        return f"{self.user_id} {self.date} {self.mood_type.emoji}"


class AttendanceRecord(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="attendance_records")
    date = models.DateField()
    check_in = models.TimeField()
    check_out = models.TimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "date"], name="unique_user_date_attendance"),
        ]
        indexes = [
            models.Index(fields=["date"]),
            models.Index(fields=["user", "date"]),
        ]
        ordering = ("-date", "user_id")

    def __str__(self) -> str:
        return f"{self.user_id} {self.date} {self.check_in}-{self.check_out}"
