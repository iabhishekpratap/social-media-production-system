from rest_framework import generics, permissions
from .models import WatchTime
from .serializers import WatchTimeSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def health_check(request):
    return Response({
        "status": "ok",
        "service": "analytics_service"
    })

class RecordWatchTimeView(generics.CreateAPIView):
    queryset = WatchTime.objects.all()
    serializer_class = WatchTimeSerializer
    permission_classes = [permissions.AllowAny]


