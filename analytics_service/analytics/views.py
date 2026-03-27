from rest_framework import generics, permissions
from .models import WatchTime
from .serializers import WatchTimeSerializer

class RecordWatchTimeView(generics.CreateAPIView):
    queryset = WatchTime.objects.all()
    serializer_class = WatchTimeSerializer
    permission_classes = [permissions.AllowAny]
