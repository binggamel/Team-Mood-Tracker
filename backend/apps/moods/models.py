from django.db import models


class MoodType(models.Model):
    key = models.CharField(max_length=30, unique=True)
    label = models.CharField(max_length=40)
    emoji = models.CharField(max_length=8)
    color = models.CharField(max_length=20, default="#E5E7EB")
    sort_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("sort_order", "id")

    def __str__(self) -> str:
        return f"{self.emoji} {self.label}"
