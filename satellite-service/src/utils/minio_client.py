import boto3
import os
from dotenv import load_dotenv

load_dotenv()

s3 = boto3.client(
    "s3",
    endpoint_url=os.getenv("MINIO_ENDPOINT"),
    aws_access_key_id=os.getenv("MINIO_ACCESS"),
    aws_secret_access_key=os.getenv("MINIO_SECRET"),
)


def upload_to_minio(local_file, remote_name, bucket):
    s3.upload_file(local_file, bucket, remote_name)
    print(f"[MINIO] OK Upload : {remote_name}")

