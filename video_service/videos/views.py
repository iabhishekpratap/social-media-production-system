from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Video
from .serializers import VideoSerializer
from .s3_utils import upload_video_to_s3
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import api_view

@api_view(['GET'])
def health_check(request):
    return Response({
        "status": "ok",
        "service": "video_service"
    })

class VideoListCreateView(generics.ListCreateAPIView):
    queryset = Video.objects.all()
    serializer_class = VideoSerializer
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [permissions.AllowAny] # In true setup, validate JWT against auth service

    def create(self, request, *args, **kwargs):
        file_obj = request.FILES.get('video_file')
        if not file_obj:
            return Response({'error': 'No video file provided'}, status=status.HTTP_400_BAD_REQUEST)
            
        ALLOWED_TYPES = ["video/mp4", "video/webm"]
        if file_obj.content_type not in ALLOWED_TYPES:
            return Response({'error': 'Unsupported video format. Only MP4 and WebM are allowed.'}, status=status.HTTP_400_BAD_REQUEST)
        
        s3_url = upload_video_to_s3(file_obj, file_obj.name)
        if not s3_url:
            return Response({'error': 'Failed to upload video to S3. Check AWS credentials.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        creator_id = request.data.get('creator_id', 1)

        video = Video.objects.create(
            title=request.data.get('title', 'Untitled'),
            description=request.data.get('description', ''),
            s3_video_url=s3_url,
            creator_id=creator_id
        )
        
        serializer = self.get_serializer(video)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class VideoDetailView(generics.RetrieveAPIView):
    queryset = Video.objects.all()
    serializer_class = VideoSerializer
    permission_classes = [permissions.AllowAny]

