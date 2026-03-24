from django.db import models

class Video(models.Model):
    title = models.CharField(max_length=200)
    video_file = models.FileField(upload_to='videos/')
    author_id = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
