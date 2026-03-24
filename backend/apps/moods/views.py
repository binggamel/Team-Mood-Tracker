from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import ListCreateAPIView
from .models import MoodType
from .serializers import MoodTypeSerializer


class MoodTypeListView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MoodTypeSerializer

    def get_queryset(self):
        return MoodType.objects.filter(is_active=True)
