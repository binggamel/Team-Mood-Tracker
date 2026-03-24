from django.contrib.auth.models import AbstractUser
from django.db import models
from .managers import UserManager


class User(AbstractUser):
    ROLE_CHOICES = (
        ("admin", "Admin"),
        ("member", "Member"),
    )
    username = None
    name = models.CharField(max_length=50)
    login_id = models.CharField(max_length=50, unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="member")

    USERNAME_FIELD = "login_id"
    REQUIRED_FIELDS = ["name"]
    objects = UserManager()

    def __str__(self) -> str:
        return f"{self.name} ({self.login_id})"
