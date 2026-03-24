from django.urls import path
from .views import RegisterView, CustomAuthToken

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', CustomAuthToken.as_view(), name='auth_login'),
]
