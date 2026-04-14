from django.urls import path
from .views import RecordWatchTimeView
from .views import health_check

urlpatterns = [
    path('record/', RecordWatchTimeView.as_view(), name='record-watch-time'),
    path('health/', health_check, name='health_check'),
]
