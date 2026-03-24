from rest_framework import serializers
from .models import User


class MeSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "name", "login_id", "role")
