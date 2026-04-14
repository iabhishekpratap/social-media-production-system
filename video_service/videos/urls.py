from django.urls import path
from .views import VideoListCreateView, VideoDetailView
from .views import health_check

urlpatterns = [
    path('', VideoListCreateView.as_view(), name='video-list-create'),
    path('<uuid:pk>/', VideoDetailView.as_view(), name='video-detail'),
    path('health/', health_check, name='health_check'),
]
