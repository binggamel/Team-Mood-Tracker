from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("entries", "0003_attendancerecord"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name="moodentry",
            name="likes",
            field=models.ManyToManyField(blank=True, related_name="liked_mood_entries", to=settings.AUTH_USER_MODEL),
        ),
    ]
