from rest_framework import generics
from rest_framework.permissions import AllowAny
from django.contrib.auth.models import User
from .serializers import UserRegistrationSerializer

from rest_framework.decorators import api_view
from rest_framework.response import Response

class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserRegistrationSerializer


@api_view(['GET'])
def health_check(request):
    return Response({
        "status": "ok",
        "service": "users_service"
    })