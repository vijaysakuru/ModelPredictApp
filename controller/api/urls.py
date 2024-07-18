from django.urls import path
from .views import register, login, predict, userProfile, admin, delete_user, getNonAdminUsers
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('register/', register, name='register'),  # Fixed by adding the view function 'register' as an argument
    path('login/', login, name='login'),
    path('predict/', predict, name='predict'),
    path('userProfile/', userProfile, name='userProfile'),
    path('admin/', admin, name='admin'),  # New
    path('getNonAdminUsers/', getNonAdminUsers, name='getNonAdminUsers'),
    path('delete_user/<uuid:user_id>/', delete_user, name='delete_user'),  # Endpoint to handle user deletion
] + static(settings.STATIC_URL, document_root=settings.BASE_DIR / 'api' / 'modelPredictions')
