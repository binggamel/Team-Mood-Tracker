from django.urls import path
from .views import EntryRangeListView, EntryUpsertView, EntryDetailView, EntryByDateView, MatrixView

urlpatterns = [
    path("", EntryRangeListView.as_view(), name="entry_range"),
    path("upsert/", EntryUpsertView.as_view(), name="entry_upsert"),
    path("<int:pk>/", EntryDetailView.as_view(), name="entry_detail"),
    path("date/<str:date>/", EntryByDateView.as_view(), name="entry_by_date"),
    path("matrix/", MatrixView.as_view(), name="entry_matrix"),
]
