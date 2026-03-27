import uuid
from django.db import models

class Video(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    s3_video_url = models.URLField(max_length=500)
    # Storing ID since the actual User object lives in the Users Service Database
    creator_id = models.IntegerField(help_text="ID of the user from the Users Service")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title
