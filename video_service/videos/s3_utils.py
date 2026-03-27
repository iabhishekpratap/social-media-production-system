import boto3
import os
from botocore.exceptions import NoCredentialsError
import uuid

def get_s3_client():
    return boto3.client(
        's3',
        aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
        region_name=os.getenv('AWS_REGION', 'us-east-1')
    )

def upload_video_to_s3(file_obj, original_filename):
    s3 = get_s3_client()
    bucket_name = os.getenv('AWS_STORAGE_BUCKET_NAME')
    
    # Generate unique filename to prevent overwrites
    ext = original_filename.split('.')[-1]
    unique_filename = f"videos/{uuid.uuid4().hex}.{ext}"
    
    try:
        s3.upload_fileobj(
            file_obj,
            bucket_name,
            unique_filename,
            ExtraArgs={'ContentType': 'video/mp4'}
        )
        
        region = os.getenv('AWS_REGION', 'us-east-1')
        url = f"https://{bucket_name}.s3.{region}.amazonaws.com/{unique_filename}"
        return url
    except NoCredentialsError:
        print("AWS Credentials not available")
        return None
    except Exception as e:
        print(f"Error uploading to S3: {e}")
        return None
