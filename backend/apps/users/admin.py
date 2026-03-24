from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    ordering = ("id",)
    list_display = ("id", "name", "login_id", "role", "is_active")
    fieldsets = (
        (None, {"fields": ("login_id", "password")}),
        ("Personal info", {"fields": ("name",)}),
        ("Permissions", {"fields": ("role", "is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("login_id", "name", "password1", "password2", "role", "is_staff", "is_superuser"),
            },
        ),
    )
