from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from uuid import uuid4

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)  # Hashes the password
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, **extra_fields):
        extra_fields['is_staff'] = True
        extra_fields['is_superuser'] = True

        return self.create_user(email, password, **extra_fields)

## Django default AbstractBaseUser include password hashing email storing.
class User(AbstractBaseUser, PermissionsMixin):
    user_id = models.UUIDField(default=uuid4, editable=False, unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phoneNumber = models.CharField(max_length=20)
    email = models.EmailField(unique=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'phoneNumber']

    def __str__(self):
        return self.email
    
class RegressionModel(models.Model):
    data = models.JSONField()

    def __str__(self):
        return str(self.data)
    
    class Meta:
        db_table = 'regression_model'
