from django.urls import path
from .views import RecordWatchTimeView

urlpatterns = [
    path('record/', RecordWatchTimeView.as_view(), name='record-watch-time'),
]
