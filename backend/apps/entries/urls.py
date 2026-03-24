from django.urls import path
from .views import (
    EntryRangeListView,
    EntryUpsertView,
    EntryDetailView,
    EntryByDateView,
    EntryLikeToggleView,
    MatrixView,
    AttendanceByDateView,
    AttendanceUpsertView,
)

urlpatterns = [
    path("", EntryRangeListView.as_view(), name="entry_range"),
    path("upsert/", EntryUpsertView.as_view(), name="entry_upsert"),
    path("<int:pk>/", EntryDetailView.as_view(), name="entry_detail"),
    path("date/<str:date>/", EntryByDateView.as_view(), name="entry_by_date"),
    path("<int:pk>/like/", EntryLikeToggleView.as_view(), name="entry_like_toggle"),
    path("matrix/", MatrixView.as_view(), name="entry_matrix"),
    path("attendance/date/<str:date>/", AttendanceByDateView.as_view(), name="attendance_by_date"),
    path("attendance/upsert/", AttendanceUpsertView.as_view(), name="attendance_upsert"),
]
