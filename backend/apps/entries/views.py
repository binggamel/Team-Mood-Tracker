from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from rest_framework.generics import ListAPIView, RetrieveUpdateAPIView
from .models import MoodEntry, AttendanceRecord
from .serializers import MoodEntrySerializer, EntryUpsertSerializer, AttendanceRecordSerializer, AttendanceUpsertSerializer
from .permissions import IsOwnerOrAdmin

User = get_user_model()


class EntryRangeListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MoodEntrySerializer

    def get_queryset(self):
        start = self.request.query_params.get("start")
        end = self.request.query_params.get("end")
        qs = MoodEntry.objects.select_related("user", "mood_type").prefetch_related("likes")
        if start and end:
            qs = qs.filter(date__range=[start, end])
        return qs


class EntryUpsertView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = EntryUpsertSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        entry, _ = MoodEntry.objects.update_or_create(
            user=request.user,
            date=serializer.validated_data["date"],
            defaults={
                "mood_type": serializer.validated_data["mood_type"],
                "comment": serializer.validated_data.get("comment", ""),
            },
        )
        return Response(MoodEntrySerializer(entry).data, status=status.HTTP_200_OK)


class EntryDetailView(RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
    serializer_class = MoodEntrySerializer
    queryset = MoodEntry.objects.select_related("user", "mood_type").prefetch_related("likes")


class EntryByDateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, date: str):
        entries = MoodEntry.objects.select_related("user", "mood_type").prefetch_related("likes").filter(date=date)
        return Response(MoodEntrySerializer(entries, many=True).data)


class EntryLikeToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk: int):
        entry = get_object_or_404(MoodEntry, pk=pk)
        if entry.likes.filter(pk=request.user.pk).exists():
            entry.likes.remove(request.user)
            liked_by_me = False
        else:
            entry.likes.add(request.user)
            liked_by_me = True
        return Response(
            {
                "entry_id": entry.id,
                "like_count": entry.likes.count(),
                "liked_by_me": liked_by_me,
            },
            status=status.HTTP_200_OK,
        )


class MatrixView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        start = request.query_params.get("start")
        end = request.query_params.get("end")
        if not start or not end:
            return Response({"detail": "start/end query params required"}, status=status.HTTP_400_BAD_REQUEST)

        users = User.objects.filter(is_active=True).order_by("name")
        entries = MoodEntry.objects.select_related("mood_type", "user").filter(date__range=[start, end])

        matrix = {}
        for user in users:
            matrix[str(user.id)] = {
                "user_id": user.id,
                "name": user.name,
                "days": {},
            }

        for entry in entries:
            matrix[str(entry.user_id)]["days"][str(entry.date)] = {
                "entry_id": entry.id,
                "mood_type": entry.mood_type_id,
                "emoji": entry.mood_type.emoji,
                "color": entry.mood_type.color,
                "comment": entry.comment,
            }

        return Response({"start": start, "end": end, "rows": list(matrix.values())})


class AttendanceByDateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, date: str):
        records = AttendanceRecord.objects.select_related("user").filter(date=date, user__role="member", user__is_active=True)
        return Response(AttendanceRecordSerializer(records, many=True).data)


class AttendanceUpsertView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = AttendanceUpsertSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        record, _ = AttendanceRecord.objects.update_or_create(
            user=request.user,
            date=serializer.validated_data["date"],
            defaults={
                "check_in": serializer.validated_data["check_in"],
                "check_out": serializer.validated_data["check_out"],
            },
        )
        return Response(AttendanceRecordSerializer(record).data, status=status.HTTP_200_OK)
