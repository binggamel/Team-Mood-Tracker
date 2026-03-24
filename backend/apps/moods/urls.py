from django.urls import path
from .views import MoodTypeListView

urlpatterns = [
    path("", MoodTypeListView.as_view(), name="mood_list"),
]
