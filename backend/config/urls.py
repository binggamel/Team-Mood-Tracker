from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.users.urls")),
    path("api/moods/", include("apps.moods.urls")),
    path("api/entries/", include("apps.entries.urls")),
]
