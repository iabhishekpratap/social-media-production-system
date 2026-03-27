import uuid
from django.db import models

class WatchTime(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_id = models.IntegerField(help_text="ID of the user from Users Service")
    video_id = models.UUIDField(help_text="UUID of the video from Video Service")
    watch_duration_seconds = models.FloatField(default=0.0)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user_id']),
            models.Index(fields=['video_id']),
        ]

    def __str__(self):
        return f"User {self.user_id} watched Video {self.video_id} for {self.watch_duration_seconds}s"
