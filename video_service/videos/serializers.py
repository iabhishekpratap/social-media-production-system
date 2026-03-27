from rest_framework import serializers
from .models import Video

class VideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        fields = ['id', 'title', 'description', 's3_video_url', 'creator_id', 'created_at']
        read_only_fields = ['id', 's3_video_url', 'created_at']
