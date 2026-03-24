from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User
from .serializers import MeSerializer


class LoginSerializer(TokenObtainPairSerializer):
    username_field = "login_id"


class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(MeSerializer(request.user).data)


class UserListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MeSerializer
    queryset = User.objects.filter(is_active=True, role="member").order_by("name")
